"use client";

import { useEffect, useId, useRef, useState } from "react";
import { money } from "@/lib/format";

export type TransactionOption = { id: string; name: string; email: string; available: number };

export function TransactionPicker({ transactions }: { transactions: TransactionOption[] }) {
  const listId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<TransactionOption | null>(null);
  const search = query.trim().toLowerCase();
  const matches = transactions.filter(t => `${t.id} ${t.name} ${t.email}`.toLowerCase().includes(search));
  const activeId = open && matches[active] ? `${listId}-${matches[active].id}` : undefined;

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  function choose(option: TransactionOption) {
    setSelected(option);
    setQuery("");
    setOpen(false);
    input.current?.setCustomValidity("");
  }

  return <div>
    <label htmlFor={`${listId}-input`}>Find a transaction</label>
    <div className="tx-picker" onBlur={e => {
      if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
    }}>
      <input ref={input} id={`${listId}-input`} role="combobox" aria-autocomplete="list"
        aria-expanded={open} aria-controls={listId} aria-activedescendant={activeId}
        required autoComplete="off" placeholder="Search by name, email, or transaction ID"
        value={selected ? `${selected.name} / ${selected.id}` : query}
        onFocus={e => { setOpen(true); setActive(-1); if (selected) e.target.select(); }}
        onClick={() => setOpen(true)}
        onChange={e => {
          setQuery(e.target.value); setSelected(null); setOpen(true); setActive(0);
          e.target.setCustomValidity(e.target.value ? "Select a transaction from the dropdown." : "");
        }}
        onKeyDown={e => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault(); setOpen(true);
            const last = matches.length - 1;
            setActive(e.key === "ArrowDown" ? Math.min(open ? active + 1 : 0, last)
              : !open || active < 0 ? last : Math.max(0, active - 1));
          } else if (open && e.key === "Enter") {
            e.preventDefault();
            if (matches[active]) choose(matches[active]);
          } else if (open && e.key === "Escape") {
            e.preventDefault(); setOpen(false);
          }
        }}/>
      <button className="tx-toggle" type="button" tabIndex={-1} aria-label={open ? "Close transactions" : "Browse transactions"}
        aria-expanded={open} aria-controls={listId} onMouseDown={e => e.preventDefault()}
        onClick={() => { input.current?.focus(); setOpen(!open); setActive(-1); }}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.6"/></svg>
      </button>
      <div className="tx-dropdown" hidden={!open}>
        <ul id={listId} role="listbox" aria-label="Matching transactions">
          {matches.map((t, index) => <li key={t.id} id={`${listId}-${t.id}`} role="option"
            aria-selected={selected?.id === t.id} data-active={index === active}
            onMouseDown={e => e.preventDefault()} onClick={() => choose(t)}>
            <div className="min-w-0"><strong>{t.name}</strong><small>{t.id} / {t.email}</small></div>
            <div className="text-right"><span className="mono">{money(t.available)}</span><small>available</small></div>
          </li>)}
        </ul>
        {!matches.length && <p role="status">No matching transactions.</p>}
      </div>
    </div>
    <input type="hidden" name="transactionId" value={selected?.id ?? ""}/>
    {selected && <p className="balance mt-2">Available to refund <b>{money(selected.available)}</b></p>}
  </div>;
}
