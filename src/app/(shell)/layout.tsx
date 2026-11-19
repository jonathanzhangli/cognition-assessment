import Link from "next/link";
import type { ReactNode } from "react";
import { visibleApps } from "@/apps/registry";
import { Brand } from "@/components/identity";
import { NavLink } from "@/components/nav-link";
import { requireUser, signOut } from "@/lib/auth";

export default async function ShellLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return <div className="shell">
    <aside className="sidebar">
      <Link href="/" className="sidebar-brand" aria-label="Folio home"><Brand/></Link>
      <nav aria-label="Workspace navigation">
        <div><p className="nav-label">Workspace</p>
          <NavLink href="/" name="Overview" icon="home"/>
          {user.role !== "agent" && <NavLink href="/approvals" name="Approvals" icon="inbox"/>}
          {user.role === "admin" && <NavLink href="/audit" name="Audit log" icon="audit"/>}
        </div>
        <div><p className="nav-label">Applications</p>
          {visibleApps(user.role).map(app => <NavLink key={app.id} {...app} icon="app"/>)}
        </div>
      </nav>
      <div className="sidebar-foot"><span className="dot"/> Internal workspace</div>
    </aside>
    <div className="shell-body">
      <header className="topbar"><span className="micro">Folio &nbsp;/&nbsp; Operations</span>
        <div className="flex items-center gap-3">
          <span className="avatar" aria-hidden="true">{user.name.split(" ").map(n => n[0]).join("")}</span>
          <div className="account"><b>{user.name}</b><span>{user.role}</span></div>
          <form action={async () => { "use server"; await requireUser(); await signOut({ redirectTo: "/login" }); }}>
            <button className="sign-out">Sign out</button>
          </form>
        </div>
      </header>
      <main className="workspace">{children}</main>
    </div>
  </div>;
}
