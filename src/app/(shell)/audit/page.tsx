import { AuditTable } from "@/components/audit-table";
import { Heading } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Audit log" };
export default async function AuditPage({ searchParams }: { searchParams: Promise<{ entityType?: string | string[] }> }) {
  await requireRole("admin");
  const filter = (await searchParams).entityType;
  const entityType = typeof filter === "string" ? filter : undefined;
  const [entries, types] = await Promise.all([
    db.auditLog.findMany({ where: { entityType: entityType || undefined },
      include: { actor: { select: { name: true } } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }] }),
    db.auditLog.findMany({ select: { entityType: true }, distinct: ["entityType"], orderBy: { entityType: "asc" } }),
  ]);
  return <>
    <Heading eyebrow="Workspace / Controls" title="Audit log" description="A chronological record of every change across the workspace."/>
    <section className="panel"><div className="panel-head"><h2>Recorded events</h2>
      <form className="filter-form"><label className="sr-only" htmlFor="entityType">Entity type</label>
        <select name="entityType" id="entityType" defaultValue={entityType || ""}>
          <option value="">All entities</option>{types.map(t => <option key={t.entityType}>{t.entityType}</option>)}
        </select><button className="btn secondary compact">Filter</button></form></div>
      <AuditTable entries={entries}/>
    </section>
  </>;
}
