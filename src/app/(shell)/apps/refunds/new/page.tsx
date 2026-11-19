import Link from "next/link";
import { refundRoles } from "@/apps/registry";
import { Heading } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { RefundForm } from "./refund-form";

export const metadata = { title: "New refund" };
export default async function NewRefundPage() {
  await requireRole(...refundRoles);
  const transactions = await db.transaction.findMany({
    include: { customer: true, refunds: { where: { status: { not: "REJECTED" } }, select: { amountCents: true } } },
    orderBy: { id: "asc" },
  });
  return <>
    <Link href="/apps/refunds" className="back">&larr; Refund ledger</Link>
    <Heading eyebrow="Refunds / Intake" title="New refund" description="Choose the original transaction and record the reason for the return."/>
    <div className="entry-grid"><RefundForm transactions={transactions.map(t => ({
      id: t.id, name: t.customer.name, email: t.customer.email,
      available: t.amountCents - t.refunds.reduce((sum, r) => sum + r.amountCents, 0),
    }))}/>
      <aside className="policy-note"><p className="eyebrow">Approval policy</p><h2>Two paths to execution.</h2>
        <p><b>$500.00 or less</b><br/>Approved automatically when the request is created.</p>
        <p><b>Over $500.00</b><br/>A manager or admin other than the requester must sign off.</p>
      </aside>
    </div>
  </>;
}
