import { redirect } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { Brand, Engraving } from "@/components/identity";
import { auth } from "@/lib/auth";
import { login } from "./actions";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if ((await auth())?.user.id) redirect("/");
  return <main className="login-page">
    <header className="login-top"><Brand/><span className="micro">Internal tools platform</span></header>
    <div className="login-grid">
      <section className="login-panel">
        <p className="eyebrow"><span className="rule-mark"/>Workspace access</p>
        <h1>Welcome back.</h1>
        <p className="lede">Sign in to your operations workspace.</p>
        <ActionForm action={login} className="login-form">
          <label>Work email<input name="email" type="email" autoComplete="username" placeholder="you@company.com" required/></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required/></label>
          <button className="btn primary w-full justify-between">Sign in <span aria-hidden="true">&rarr;</span></button>
        </ActionForm>
        <details className="demo-note"><summary>Demo credentials</summary>
          <p>Use <code>agent@demo.com</code>, <code>agent2@demo.com</code>, <code>manager@demo.com</code>, or <code>admin@demo.com</code> with password <code>password123</code>.</p>
        </details>
      </section>
      <aside className="print-panel">
        <div className="print-index"><span>Folio &nbsp;/&nbsp; Operations</span><span>Plate 01</span></div>
        <div className="print-art"><Engraving/></div>
        <div className="print-caption"><p className="micro">The operations ledger</p>
          <h2>Every action,<br/><i>on the record.</i></h2>
          <p>One workspace for requests, approvals,<br/>and the trail that connects them.</p>
        </div>
      </aside>
    </div>
    <footer className="login-footer"><span>Folio &nbsp;/&nbsp; Internal operations</span><span>Workspace edition &nbsp; 01</span></footer>
  </main>;
}
