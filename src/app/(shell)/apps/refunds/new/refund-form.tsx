"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { money } from "@/lib/format";
import { requestRefund } from "../actions";

type Option = { id: string; name: string; email: string; available: number };
export function RefundForm({ transactions }: { transactions: Option[] }) {
  const [query, setQuery] = useState("");
  const [id, setId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, submit, pending] = useActionState(requestRefund, "");
  const matches = transactions.filter(t => `${t.id} ${t.name} ${t.email}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = matches.find(t => t.id === id);
  return <form action={submit} className="panel form-panel">
    <fieldset disabled={pending} className="form-fields">
      <legend className="sr-only">Refund request</legend>
      <label>Find a transaction<input type="search" placeholder="Customer name, email, or transaction ID" value={query}
        onChange={e => { setQuery(e.target.value); setId(""); }}/></label>
      <label>Original transaction<select required name="transactionId" value={id} onChange={e => setId(e.target.value)}>
        <option value="">{matches.length ? "Select a transaction" : "No matching transactions"}</option>
        {matches.map(t => <option key={t.id} value={t.id}>{t.id} / {t.name} / {money(t.available)} available</option>)}
      </select></label>
      {selected && <p className="balance">Available to refund <b>{money(selected.available)}</b></p>}
      <label>Refund amount (USD)<input name="amount" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required/></label>
      <label>Reason<textarea name="reason" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Why is this refund being requested?" required/></label>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="flex items-center gap-5"><button className="btn primary">{pending ? "Submitting..." : "Create refund"}</button>
        <Link className="text-link" href="/apps/refunds">Cancel</Link></div>
    </fieldset>
  </form>;
}
