import type { ApprovalStatus, Role } from "@prisma/client";

// Only intentional business-rule errors should be shown to a form's user.
export class RuleError extends Error {}

export function assertCanDecide(
  request: { requestedById: string; status: ApprovalStatus },
  user: { id: string; role: Role },
) {
  if (user.role !== "manager" && user.role !== "admin") {
    throw new RuleError("Only managers and admins can decide requests.");
  }
  if (request.requestedById === user.id) throw new RuleError("You cannot decide your own request.");
  if (request.status !== "PENDING") throw new RuleError("This request has already been decided.");
}
