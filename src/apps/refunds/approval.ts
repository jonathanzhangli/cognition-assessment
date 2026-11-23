import type { Prisma } from "@prisma/client";
import { logAudit } from "../../lib/audit";
import { RuleError } from "../../lib/rules";
import { decidedStatus } from "./rules";

export async function applyRefundDecision(
  tx: Prisma.TransactionClient, id: string, decision: "APPROVED" | "REJECTED", actorId: string, at: Date,
) {
  const status = decidedStatus(decision);
  const updated = await tx.refund.updateMany({
    where: { id, status: "PENDING_APPROVAL" }, data: { status, updatedAt: at },
  });
  if (updated.count !== 1) throw new RuleError("This refund is no longer pending approval.");
  await logAudit(tx, {
    actorId, entityType: "refund", entityId: id, action: status.toLowerCase(),
    before: { status: "PENDING_APPROVAL" }, after: { status }, createdAt: at,
  });
}
