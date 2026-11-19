import type { ReactNode } from "react";

export const statusLabels = {
  PENDING_APPROVAL: "Pending approval", PENDING: "Pending", APPROVED: "Approved",
  REJECTED: "Rejected", REFUNDED: "Refunded",
};
export function Status({ value }: { value: keyof typeof statusLabels }) {
  return <span className={`badge badge-${value.toLowerCase()}`}>{statusLabels[value]}</span>;
}

export function Heading({ eyebrow, title, description, action }: {
  eyebrow: string; title: string; description: string; action?: ReactNode;
}) {
  return <div className="page-heading">
    <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lede">{description}</p></div>
    {action}
  </div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>;
}
