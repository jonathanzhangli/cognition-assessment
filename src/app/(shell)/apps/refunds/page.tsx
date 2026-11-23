import { RefundStatus } from "@prisma/client";
import Link from "next/link";
import { refundRoles } from "@/apps/registry";
import { Empty, Heading, Status, statusLabels } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { dateTime, easternDayAt } from "@/lib/time";

export const metadata = { title: "Refunds" };
export default async function RefundsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireRole(...refundRoles);
  const params = await searchParams;
  const selected = Object.values(RefundStatus).find(s => s === params.status);
  const midnight = easternDayAt(new Date(), 0, 0);
  const [pending, today, total, refunds] = await Promise.all([
    db.refund.count({ where: { status: "PENDING_APPROVAL" } }),
    db.refund.aggregate({ where: { status: "REFUNDED", updatedAt: { gte: midnight } }, _sum: { amountCents: true } }),
    db.refund.aggregate({ where: { status: "REFUNDED" }, _sum: { amountCents: true } }),
    db.refund.findMany({ where: { status: selected }, include: {
      transaction: { include: { customer: true } }, requestedBy: { select: { name: true } },
    }, orderBy: { createdAt: "desc" } }),
  ]);
  return <>
    <Heading eyebrow="Applications / Financial operations" title="Refunds" description="Track refund requests from intake through execution."
      action={<Link className="btn primary" href="/apps/refunds/new">+ &nbsp; New refund</Link>}/>
    <div className="stats">
      <div><p className="micro">Pending approval</p><strong>{pending}</strong><small>Awaiting sign-off</small></div>
      <div><p className="micro">Refunded today</p><strong>{money(today._sum.amountCents ?? 0)}</strong><small>Since midnight ET</small></div>
      <div><p className="micro">Refunded total</p><strong>{money(total._sum.amountCents ?? 0)}</strong><small>All executed refunds</small></div>
    </div>
    <section className="panel"><div className="panel-head"><h2>Refund ledger</h2>
      <form className="filter-form"><label className="sr-only" htmlFor="status">Refund status</label><select id="status" name="status" defaultValue={selected ?? ""}>
        <option value="">All statuses</option>{Object.values(RefundStatus).map(s => <option value={s} key={s}>{statusLabels[s]}</option>)}
      </select><button className="btn secondary compact">Filter</button></form></div>
      {refunds.length ? <div className="table-scroll"><table><thead><tr>
        <th>Customer</th><th className="numeric">Amount</th><th>Requester</th><th>Status</th><th>Created</th>
      </tr></thead><tbody>{refunds.map(r => <tr key={r.id}>
        <td><Link className="text-link" href={`/apps/refunds/${r.id}`}>{r.transaction.customer.name} <span aria-hidden="true">&#8599;</span></Link><small className="mono">{r.transactionId}</small></td>
        <td className="numeric">{money(r.amountCents)}</td><td>{r.requestedBy.name}</td><td><Status value={r.status}/></td><td>{dateTime(r.createdAt)}</td>
      </tr>)}</tbody></table></div> : <Empty>No refunds match this status.</Empty>}
    </section>
  </>;
}
