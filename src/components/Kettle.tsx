// F-C4 signature: the pause is a kettle on a kitchen-timer dial. The yellow
// wedge is the time left; steam builds as the ten minutes run out. Nothing
// about it says “security” — it says “sit down, put the kettle on”.

export function KettleDial({ left, total, size = 220 }: { left: number; total: number; size?: number }) {
  const frac = Math.max(0, Math.min(1, left / total))
  const R = 104
  const C = 2 * Math.PI * R
  const steam = frac === 0 ? 3 : frac < 0.34 ? 3 : frac < 0.67 ? 2 : 1
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" className="k-kettle" aria-hidden>
      <circle cx="120" cy="120" r={R} fill="none" stroke="var(--duck-2)" strokeWidth="16" />
      <circle
        cx="120"
        cy="120"
        r={R}
        fill="none"
        stroke="var(--yolk)"
        strokeWidth="16"
        strokeDasharray={`${C * frac} ${C}`}
        transform="rotate(-90 120 120)"
        style={{ transition: 'stroke-dasharray .25s linear' }}
      />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2
        const x1 = 120 + Math.cos(a) * 86
        const y1 = 120 + Math.sin(a) * 86
        const x2 = 120 + Math.cos(a) * (i === 0 ? 76 : 80)
        const y2 = 120 + Math.sin(a) * (i === 0 ? 76 : 80)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--navy)" strokeWidth={i === 0 ? 4 : 2.5} strokeLinecap="round" />
      })}
      <g stroke="var(--navy)" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        {/* handle */}
        <path d="M93 104 Q91 62 120 62 Q149 62 147 104" fill="none" strokeWidth="7" />
        {/* spout */}
        <path d="M86 140 L60 114 Q57 110 61 108 L67 106 L92 124 Z" fill="var(--yolk)" />
        {/* body */}
        <path d="M78 176 L86 116 Q88 104 100 104 H140 Q152 104 154 116 L162 176 Q163 182 156 182 H84 Q77 182 78 176 Z" fill="var(--yolk)" />
        {/* lid */}
        <path d="M102 104 Q102 90 120 90 Q138 90 138 104 Z" fill="var(--yolk)" />
        <circle cx="120" cy="85" r="5" fill="var(--navy)" />
        {/* base band */}
        <path d="M80 170 H160" strokeWidth="4" />
      </g>
      <path d="M97 122 Q93 146 97 166" stroke="var(--enamel)" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".85" />
      <g className="k-steam" stroke="var(--navy-2)" strokeWidth="3.5" strokeLinecap="round" fill="none">
        {[0, 1, 2].slice(0, steam).map((i) => (
          <path key={i} className={`k-steam__p k-steam__p--${i}`} d={`M${58 - i * 9} ${100 - i * 2} q-7 -9 0 -17 q7 -8 0 -17`} />
        ))}
      </g>
    </svg>
  )
}

export const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
