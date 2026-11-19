export function Brand() {
  return <span className="brand">
    <svg aria-hidden="true" viewBox="0 0 34 34" width="32" height="32" fill="none">
      <path d="M4 7 18 3l12 4-14 5z" fill="currentColor"/>
      <path d="m4 12 12 4 14-5v5l-14 5-12-4zm0 10 12 4 14-5v5l-14 5-12-4z" fill="currentColor"/>
    </svg>Folio<span className="brand-period">.</span>
  </span>;
}

// A printed guilloche motif, drawn locally so the workspace needs no asset service.
export function Engraving() {
  return <svg className="engraving" viewBox="0 0 440 280" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth=".85">
      {Array.from({ length: 72 }, (_, i) => <ellipse key={i} cx="220" cy="140" rx="139" ry="61"
        transform={`rotate(${i * 2.5} 220 140)`} />)}
      <circle cx="220" cy="140" r="51" strokeDasharray="1 4"/>
      <circle cx="220" cy="140" r="145" strokeDasharray="1 6"/>
    </g>
    <path d="m220 114 16 26-16 26-16-26z M220 114v52 M204 140h32" stroke="currentColor" />
  </svg>;
}
