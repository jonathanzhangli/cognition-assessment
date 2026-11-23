import type { Prisma, Role } from "@prisma/client";
import { applyRefundDecision } from "../apps/refunds/approval";
import { logAudit } from "./audit";
import { db } from "./db";
import { assertCanDecide, RuleError } from "./rules";

type Handler = {
  href: (id: string) => string;
  apply: typeof applyRefundDecision;
};
export const approvalHandlers: Record<string, Handler | undefined> = {
  refund: { href: id => `/apps/refunds/${id}`, apply: applyRefundDecision },
};

export async function createApprovalRequest(tx: Prisma.TransactionClient, data: {
  entityType: string; entityId: string; summary: string; requestedById: string; createdAt?: Date;
}) {
  if (!approvalHandlers[data.entityType]) throw new Error("No approval handler registered.");
  const request = await tx.approvalRequest.create({ data });
  await logAudit(tx, {
    actorId: data.requestedById, action: "created", entityType: "approval", entityId: request.id,
    after: request, createdAt: request.createdAt,
  });
  return request;
}

export async function decideApproval(
  id: string, decision: "APPROVED" | "REJECTED", comment: string,
  user: { id: string; role: Role },
) {
  return db.$transaction(tx => recordDecision(tx, id, decision, comment, user));
}

export async function recordDecision(
  tx: Prisma.TransactionClient, id: string, decision: "APPROVED" | "REJECTED", comment: string,
  user: { id: string; role: Role }, at = new Date(),
) {
  const request = await tx.approvalRequest.findUnique({ where: { id } });
  if (!request) throw new RuleError("Approval request not found.");
  assertCanDecide(request, user);
  if (decision !== "APPROVED" && decision !== "REJECTED") throw new RuleError("Invalid decision.");
  const handler = approvalHandlers[request.entityType];
  if (!handler) throw new Error("No approval handler registered.");
  const change = { status: decision, decidedById: user.id, decidedAt: at, comment: comment.trim() || null };
  const result = await tx.approvalRequest.updateMany({ where: { id, status: "PENDING" }, data: change });
  if (result.count !== 1) throw new RuleError("This request has already been decided.");
  await logAudit(tx, {
    actorId: user.id, action: decision.toLowerCase(), entityType: "approval", entityId: id,
    before: { status: request.status }, after: change, createdAt: at,
  });
  await handler.apply(tx, request.entityId, decision, user.id, at);
}
