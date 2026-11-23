import Link from "next/link";
import { notFound } from "next/navigation";
import { refundRoles } from "@/apps/registry";
import { ActionForm } from "@/components/action-form";
import { AuditTable } from "@/components/audit-table";
import { Heading, Status } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { dateTime } from "@/lib/time";
import { execute } from "../actions";

export const metadata = { title: "Refund detail" };
export default async function RefundDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(...refundRoles);
  const { id } = await params;
  const [refund, approvals] = await Promise.all([
    db.refund.findUnique({ where: { id }, include: { transaction: { include: { customer: true } }, requestedBy: { select: { name: true } } } }),
    db.approvalRequest.findMany({ where: { entityType: "refund", entityId: id }, include: { decidedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!refund) notFound();
  const audit = await db.auditLog.findMany({ where: { OR: [
    { entityType: "refund", entityId: id }, { entityType: "approval", entityId: { in: approvals.map(a => a.id) } },
  ] }, include: { actor: { select: { name: true } } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }] });
  const t = refund.transaction;
  return <>
    <Link href="/apps/refunds" className="back">&larr; Refund ledger</Link>
    <Heading eyebrow="Refunds / Request detail" title={`${money(refund.amountCents)} refund`}
      description={`Requested for ${t.customer.name}`} action={<Status value={refund.status}/>}/>
    <div className="detail-grid">
      <section className="panel info"><h2>Request</h2><dl>
        <dt>Refund ID</dt><dd className="mono">{refund.id}</dd>
        <dt>Requester</dt><dd>{refund.requestedBy.name}</dd><dt>Created</dt><dd>{dateTime(refund.createdAt)}</dd>
        <dt>Reason</dt><dd>{refund.reason}</dd>
      </dl>{refund.status === "APPROVED" && <ActionForm action={execute.bind(null, id)} className="mt-5">
        <button className="btn primary">Execute refund &rarr;</button>
      </ActionForm>}</section>
      <section className="panel info"><h2>Original transaction</h2><dl>
        <dt>Transaction</dt><dd className="mono">{t.id}</dd><dt>Customer</dt><dd>{t.customer.name}<small>{t.customer.email}</small></dd>
        <dt>Amount</dt><dd>{money(t.amountCents)} {t.currency}</dd><dt>Description</dt><dd>{t.description}</dd>
        <dt>Posted</dt><dd>{dateTime(t.createdAt)}</dd>
      </dl></section>
    </div>
    <section className="panel info mt-5"><h2>Approval history</h2>
      {!approvals.length && <p className="muted mt-3">Auto-approved under the $500.00 policy. No independent sign-off required.</p>}
      {approvals.map(a => <div key={a.id} className="history">
        <Status value={a.status}/><div><p>Requested by {refund.requestedBy.name} &middot; {dateTime(a.createdAt)}</p>
          <p className="muted">{a.decidedAt ? `${a.decidedBy?.name} decided on ${dateTime(a.decidedAt)}.` : "Waiting for an independent manager or admin."}</p>
          {a.comment && <p className="mt-2">{a.comment}</p>}</div>
      </div>)}
    </section>
    <div className="section-title"><h2>Audit trail</h2><span className="count">{audit.length}</span></div>
    <div className="panel"><AuditTable entries={audit}/></div>
  </>;
}
