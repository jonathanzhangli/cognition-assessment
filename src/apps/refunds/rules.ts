import type { ApprovalStatus, RefundStatus } from "@prisma/client";
import { RuleError } from "../../lib/rules";

export function initialStatus(amountCents: number, transactionCents: number, reservedCents: number) {
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
    throw new RuleError("Refund amount must be greater than zero.");
  }
  if (amountCents > transactionCents - reservedCents) {
    throw new RuleError("Amount exceeds the remaining refundable balance.");
  }
  return amountCents <= 50_000 ? "APPROVED" : "PENDING_APPROVAL";
}

export function decidedStatus(decision: Exclude<ApprovalStatus, "PENDING">) {
  if (decision !== "APPROVED" && decision !== "REJECTED") throw new RuleError("Invalid decision.");
  return decision;
}

export function assertExecutable(status: RefundStatus) {
  if (status !== "APPROVED") throw new RuleError("Only an approved refund can be executed.");
}
