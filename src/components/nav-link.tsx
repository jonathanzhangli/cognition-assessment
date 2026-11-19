"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const paths = {
  home: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  app: "M3 7h18v13H3z M6 4h12 M7 12h6",
  inbox: "m3 14 3-9h12l3 9v5H3z M3 14h5l2 3h4l2-3h5",
  audit: "M5 3h14v18H5z M8 8h8 M8 12h8 M8 16h5",
};
export function NavLink({ href, name, icon }: { href: string; name: string; icon: keyof typeof paths }) {
  const path = usePathname();
  const active = path === href || (href !== "/" && path.startsWith(href + "/"));
  return <Link href={href} className={`nav-link ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d={paths[icon]}/></svg>
    {name}
  </Link>;
}
