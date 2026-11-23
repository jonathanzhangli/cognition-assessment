import type { Prisma } from "@prisma/client";
import { createApprovalRequest } from "../../lib/approvals";
import { logAudit } from "../../lib/audit";
import { money } from "../../lib/format";
import { RuleError } from "../../lib/rules";
import { assertExecutable, initialStatus } from "./rules";

export async function createRefund(tx: Prisma.TransactionClient, data: {
  transactionId: string; amountCents: number; reason: string; requestedById: string;
}, at = new Date()) {
  const reason = data.reason.trim();
  if (!reason) throw new RuleError("Add a reason for this refund.");
  const transaction = await tx.transaction.findUnique({
    where: { id: data.transactionId }, include: { customer: true },
  });
  if (!transaction) throw new RuleError("Select a valid transaction.");
  const reserved = await tx.refund.aggregate({
    where: { transactionId: transaction.id, status: { not: "REJECTED" } }, _sum: { amountCents: true },
  });
  const status = initialStatus(data.amountCents, transaction.amountCents, reserved._sum.amountCents ?? 0);
  const refund = await tx.refund.create({ data: { ...data, reason, status, createdAt: at, updatedAt: at } });
  await logAudit(tx, {
    actorId: data.requestedById, action: status === "APPROVED" ? "created: auto-approved" : "created",
    entityType: "refund", entityId: refund.id, after: refund, createdAt: at,
  });
  if (status === "PENDING_APPROVAL") {
    await createApprovalRequest(tx, {
      entityType: "refund", entityId: refund.id, requestedById: data.requestedById,
      summary: `${money(data.amountCents)} refund for ${transaction.customer.name}`, createdAt: at,
    });
  }
  return refund;
}

export async function executeRefund(tx: Prisma.TransactionClient, id: string, actorId: string, at = new Date()) {
  const refund = await tx.refund.findUnique({ where: { id } });
  if (!refund) throw new RuleError("Refund not found.");
  assertExecutable(refund.status);
  // TODO: call payment provider
  const result = await tx.refund.updateMany({
    where: { id, status: "APPROVED" }, data: { status: "REFUNDED", updatedAt: at },
  });
  if (result.count !== 1) throw new RuleError("This refund is no longer approved.");
  await logAudit(tx, {
    actorId, action: "executed", entityType: "refund", entityId: id,
    before: { status: refund.status }, after: { status: "REFUNDED" }, createdAt: at,
  });
}
