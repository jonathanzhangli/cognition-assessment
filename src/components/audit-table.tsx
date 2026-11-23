import type { AuditLog } from "@prisma/client";
import { dateTime } from "@/lib/time";
import { Empty } from "./ui";

type Entry = AuditLog & { actor: { name: string } };
function snapshot(json: string | null) {
  if (!json) return "None";
  return JSON.stringify(JSON.parse(json), (key, value) => {
    if (["createdAt", "updatedAt", "decidedAt"].includes(key) && typeof value === "string") {
      const date = new Date(value);
      if (Number.isFinite(date.getTime())) return dateTime(date, true);
    }
    return value;
  }, 2);
}

export function AuditTable({ entries }: { entries: Entry[] }) {
  if (!entries.length) return <Empty>No audit entries match this view.</Empty>;
  return <div className="table-scroll"><table><thead><tr>
    <th>Event</th><th>Entity</th><th>Actor</th><th>Recorded at</th><th>Changes</th>
  </tr></thead><tbody>{entries.map(entry => <tr key={entry.id}>
    <td className="event-name">{entry.action}</td>
    <td>{entry.entityType}<small className="mono">{entry.entityId}</small></td>
    <td>{entry.actor.name}</td><td className="nowrap">{dateTime(entry.createdAt)}</td>
    <td><details className="snapshot"><summary>Inspect</summary>
      <p>Before</p><pre>{snapshot(entry.before)}</pre>
      <p>After</p><pre>{snapshot(entry.after)}</pre>
    </details></td>
  </tr>)}</tbody></table></div>;
}
