import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Empty, Heading, Status } from "@/components/ui";
import { approvalHandlers } from "@/lib/approvals";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateTime } from "@/lib/time";
import { decide } from "./actions";

export const metadata = { title: "Approvals" };
function EntityLink({ request }: { request: { entityType: string; entityId: string; summary: string } }) {
  const href = approvalHandlers[request.entityType]?.href(request.entityId);
  return href ? <Link className="text-link" href={href}>{request.summary} <span aria-hidden="true">&#8599;</span></Link> : request.summary;
}

export default async function ApprovalsPage() {
  await requireRole("manager", "admin");
  const [pending, recent] = await Promise.all([
    db.approvalRequest.findMany({ where: { status: "PENDING" }, include: { requestedBy: { select: { name: true } } }, orderBy: { createdAt: "asc" } }),
    db.approvalRequest.findMany({ where: { status: { not: "PENDING" } }, include: { decidedBy: { select: { name: true } } }, orderBy: { decidedAt: "desc" }, take: 10 }),
  ]);
  return <>
    <Heading eyebrow="Workspace / Controls" title="Approvals" description="Review requests that need an independent sign-off."/>
    <div className="section-title"><h2>Pending requests</h2><span className="count">{pending.length}</span></div>
    <div className="panel">{!pending.length && <Empty>No requests are waiting for a decision.</Empty>}
      {pending.map(request => <article className="inbox-item" key={request.id}>
        <div><p className="eyebrow">{request.entityType} request</p><h3><EntityLink request={request}/></h3>
          <p className="muted">Requested by {request.requestedBy.name} &middot; {dateTime(request.createdAt)}</p></div>
        <ActionForm action={decide.bind(null, request.id)}>
          <label>Decision comment <span className="muted">(optional)</span><input name="comment" placeholder="Add context for the record"/></label>
          <div className="mt-3 flex gap-2"><button className="btn primary compact" name="decision" value="APPROVED">Approve</button>
            <button className="btn secondary compact" name="decision" value="REJECTED">Reject</button></div>
        </ActionForm>
      </article>)}
    </div>
    <div className="section-title"><h2>Recently decided</h2><span className="micro">Latest 10</span></div>
    <div className="panel">{recent.length ? <div className="table-scroll"><table><thead><tr>
      <th>Request</th><th>Decision</th><th>Decided by</th><th>Comment</th><th>Date</th>
    </tr></thead><tbody>{recent.map(r => <tr key={r.id}><td><EntityLink request={r}/></td><td><Status value={r.status}/></td>
      <td>{r.decidedBy?.name}</td><td>{r.comment || "None"}</td><td>{r.decidedAt && dateTime(r.decidedAt)}</td>
    </tr>)}</tbody></table></div> : <Empty>No decisions yet.</Empty>}</div>
  </>;
}
