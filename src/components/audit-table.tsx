import type { AuditLog } from "@prisma/client";
import { dateTime } from "@/lib/format";
import { Empty } from "./ui";

type Entry = AuditLog & { actor: { name: string } };
export function AuditTable({ entries }: { entries: Entry[] }) {
  if (!entries.length) return <Empty>No audit entries match this view.</Empty>;
  return <div className="table-scroll"><table><thead><tr>
    <th>Event</th><th>Entity</th><th>Actor</th><th>Recorded at</th><th>Changes</th>
  </tr></thead><tbody>{entries.map(entry => <tr key={entry.id}>
    <td className="event-name">{entry.action}</td>
    <td>{entry.entityType}<small className="mono">{entry.entityId}</small></td>
    <td>{entry.actor.name}</td><td className="nowrap">{dateTime(entry.createdAt)}</td>
    <td><details className="snapshot"><summary>Inspect</summary>
      <p>Before</p><pre>{entry.before ? JSON.stringify(JSON.parse(entry.before), null, 2) : "None"}</pre>
      <p>After</p><pre>{entry.after ? JSON.stringify(JSON.parse(entry.after), null, 2) : "None"}</pre>
    </details></td>
  </tr>)}</tbody></table></div>;
}
