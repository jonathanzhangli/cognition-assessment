import type { Role } from "@prisma/client";

type App = { id: string; name: string; href: string; description: string; roles: Role[] };
export const refundRoles: Role[] = ["agent", "manager", "admin"];
export const apps: App[] = [
  {
    id: "refunds", name: "Refunds", href: "/apps/refunds",
    description: "Request, review, and execute customer refunds.", roles: refundRoles,
  },
];

export function visibleApps(role: Role) {
  return apps.filter(app => app.roles.includes(role));
}
