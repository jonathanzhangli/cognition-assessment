import Link from "next/link";
import { Brand } from "@/components/identity";

export default function Forbidden() {
  return <main className="denied"><Brand/><p className="eyebrow">403 / Restricted area</p>
    <h1>Access denied.</h1><p className="lede">Your role does not have access to this area.</p>
    <Link className="btn primary" href="/">Back to workspace &rarr;</Link></main>;
}
