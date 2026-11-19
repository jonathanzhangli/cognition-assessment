"use client";

import { useActionState, type ReactNode } from "react";

export function ActionForm({ action, children, className = "" }: {
  action: (state: string, data: FormData) => Promise<string>; children: ReactNode; className?: string;
}) {
  const [error, submit, pending] = useActionState(action, "");
  return <form action={submit} className={className}>
    <fieldset disabled={pending} className="min-w-0" aria-busy={pending}>{children}</fieldset>
    {error && <p role="alert" className="error">{error}</p>}
  </form>;
}
