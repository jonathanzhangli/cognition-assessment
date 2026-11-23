"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { requestRefund } from "../actions";
import { TransactionPicker, type TransactionOption } from "./transaction-picker";

export function RefundForm({ transactions }: { transactions: TransactionOption[] }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, submit, pending] = useActionState(requestRefund, "");
  return <form action={submit} className="panel form-panel">
    <fieldset disabled={pending} className="form-fields">
      <legend className="sr-only">Refund request</legend>
      <TransactionPicker transactions={transactions}/>
      <label>Refund amount (USD)<input name="amount" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required/></label>
      <label>Reason<textarea name="reason" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Why is this refund being requested?" required/></label>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="flex items-center gap-5"><button className="btn primary">{pending ? "Submitting..." : "Create refund"}</button>
        <Link className="text-link" href="/apps/refunds">Cancel</Link></div>
    </fieldset>
  </form>;
}
