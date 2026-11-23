import { hash } from "bcryptjs";
import { createRefund, executeRefund } from "../src/apps/refunds/service";
import { recordDecision } from "../src/lib/approvals";
import { db } from "../src/lib/db";
import { easternDayAt } from "../src/lib/time";

const customers = [
  "Avery Chen", "Morgan Reed", "Sam Rivera", "Noor Khan", "Elliot Hayes",
  "Iris Patel", "Rowan Bell", "Sofia Costa", "Jules Martin", "Mika Park",
  "Lena Okafor", "Arlo Davis", "Nora Lin", "Isla James", "Theo Wells",
  "Rae Bennett", "Kai Brooks", "Nina Shah", "Owen Clark", "Imani Cole",
];

async function seed() {
  const passwordHash = await hash("password123", 12);
  await db.$transaction(async tx => {
    // Seed all fixtures atomically; subsequent setup runs preserve demo activity.
    if (await tx.transaction.findUnique({ where: { id: "TX-1001" } })) return;
    const accounts = [
      ["agent", "Alice Morgan", "agent"], ["agent2", "Evan Lee", "agent"],
      ["manager", "Maya Brooks", "manager"], ["admin", "Alex Silva", "admin"],
    ] as const;
    for (const [id, name, role] of accounts) {
      await tx.user.create({ data: { id, name, role, email: `${id}@demo.com`, passwordHash } });
    }
    for (const [i, name] of customers.entries()) {
      await tx.customer.create({ data: {
        id: `C-${i}`, name, email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
      } });
    }
    const now = new Date();
    for (let i = 0; i < 50; i++) {
      await tx.transaction.create({ data: {
        id: `TX-${1001 + i}`, customerId: `C-${i % customers.length}`,
        amountCents: i < 3 ? 300_000 : i < 13 ? 160_000 + i * 123 : 500 + (i * 27943) % 299501,
        description: ["Annual subscription", "Equipment purchase", "Account services"][i % 3],
        createdAt: easternDayAt(now, 51 - i, 10),
      } });
    }
    const amounts = [82500, 112000, 64050, 14900, 47800, 95000, 18750, 32500, 72000, 8900];
    for (const [i, amountCents] of amounts.entries()) {
      const daysAgo = amounts.length - 1 - i;
      // Today's fixture executes at seed time, even if setup runs just after midnight.
      const at = daysAgo === 0 ? new Date(now.getTime() - 60_000) : easternDayAt(now, daysAgo, 11);
      const requestedById = i % 2 ? "agent2" : "agent";
      const refund = await createRefund(tx, {
        transactionId: `TX-${1004 + i}`, amountCents, requestedById,
        reason: ["Duplicate charge", "Service cancellation", "Billing correction"][i % 3],
      }, at);
      if (i === 5 || i === 8) {
        const request = await tx.approvalRequest.findFirstOrThrow({ where: { entityType: "refund", entityId: refund.id } });
        await recordDecision(tx, request.id, i === 5 ? "REJECTED" : "APPROVED",
          i === 5 ? "Charge verified against invoice." : "Confirmed duplicate billing.",
          { id: "manager", role: "manager" }, new Date(+at + 30000));
      }
      if ([6, 7, 9].includes(i)) await executeRefund(tx, refund.id, requestedById, new Date(+at + 60000));
    }
  }, { timeout: 30000 });
  console.log("Folio demo data ready.");
}

seed().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
