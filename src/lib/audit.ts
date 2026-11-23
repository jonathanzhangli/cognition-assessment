import type { Prisma } from "@prisma/client";

type Entry = {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  createdAt?: Date;
};

export function logAudit(tx: Prisma.TransactionClient, { before, after, ...entry }: Entry) {
  return tx.auditLog.create({ data: {
    ...entry,
    before: before == null ? null : JSON.stringify(before),
    after: after == null ? null : JSON.stringify(after),
  } });
}
