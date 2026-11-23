import Link from "next/link";
import { visibleApps } from "@/apps/registry";
import { Engraving } from "@/components/identity";
import { requireUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await requireUser();
  const apps = visibleApps(user.role);
  return <>
    <section className="workspace-cover">
      <div><p className="eyebrow">Operations &nbsp;/&nbsp; Directory</p>
        <h1>Your workspace.</h1><p>Welcome back, {user.name.split(" ")[0]}. Pick an application to get started.</p></div>
      <Engraving/>
    </section>
    <div className="section-title"><h2>Applications</h2><span className="micro">{String(apps.length).padStart(2, "0")} available</span></div>
    {apps.map((app, i) => <Link href={app.href} key={app.id} className="app-card">
      <span className="app-index">{String(i + 1).padStart(2, "0")}</span>
      <div><h3>{app.name}</h3><p>{app.description}</p></div>
      <span className="app-arrow" aria-hidden="true">&#8599;</span>
    </Link>)}
  </>;
}
