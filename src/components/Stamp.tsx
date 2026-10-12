import { useId } from 'react'
import type { Member } from '../lib/types'
import { summarise } from '../lib/audio/voiceprint'

// The signature: every voice in the family is a postage stamp. Once a
// voiceprint exists, the stamp carries it — 16 rays drawn from that
// voice's own spectral envelope, so no two stamps look alike.
export function VoiceStamp({ member, size = 64, dim = false }: { member: Pick<Member, 'name' | 'color' | 'voiceprint'>; size?: number; dim?: boolean }) {
  const mask = useId()
  const w = size
  const h = Math.round(size * 1.18)
  const r = Math.max(1.6, size * 0.045)
  const step = r * 3.1
  const holes: [number, number][] = []
  for (let x = step / 2; x < w; x += step) holes.push([x, 0], [x, h])
  for (let y = step / 2; y < h; y += step) holes.push([0, y], [w, y])
  const inset = r * 2.1
  const cx = w / 2
  const cy = h / 2 - size * 0.04
  const samples = member.voiceprint?.samples
  let rays: number[] | null = null
  if (samples?.length) {
    const b = summarise(samples).bands
    const lo = Math.min(...b)
    const hi = Math.max(...b)
    rays = b.map((v) => (v - lo) / (hi - lo || 1))
  }
  const inner = size * 0.2
  const outer = size * 0.36
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={`stamp${dim ? ' is-dim' : ''}`} role="img" aria-label={`${member.name}${rays ? ', voiceprint' : ''}`}>
      <defs>
        <mask id={mask}>
          <rect width={w} height={h} fill="#fff" />
          {holes.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#000" />
          ))}
        </mask>
      </defs>
      <rect width={w} height={h} fill="var(--enamel)" mask={`url(#${mask})`} />
      <rect x={inset} y={inset} width={w - inset * 2} height={h - inset * 2} rx={size * 0.04} fill={member.color} />
      {rays ? (
        <g stroke="var(--enamel)" strokeLinecap="round" strokeWidth={Math.max(1.4, size * 0.035)} opacity={0.92}>
          {/* 16 bands mirrored into 32 rays: a symmetrical seal */}
          {[...rays, ...[...rays].reverse()].map((v, i, all) => {
            const a = (i / all.length) * Math.PI * 2 - Math.PI / 2
            const len = inner + (outer - inner) * (0.25 + 0.75 * v)
            return <line key={i} x1={cx + Math.cos(a) * inner} y1={cy + Math.sin(a) * inner} x2={cx + Math.cos(a) * len} y2={cy + Math.sin(a) * len} />
          })}
        </g>
      ) : (
        <circle cx={cx} cy={cy} r={outer * 0.92} fill="none" stroke="var(--enamel)" strokeOpacity={0.35} strokeWidth={Math.max(1, size * 0.02)} strokeDasharray={`${size * 0.03} ${size * 0.05}`} />
      )}
      <text x={cx} y={cy + size * 0.11} textAnchor="middle" fontFamily="var(--font-display)" fontSize={size * (rays ? 0.26 : 0.4)} fill="var(--enamel)">
        {member.name[0]?.toUpperCase()}
      </text>
      <rect x={inset} y={h - inset - size * 0.15} width={w - inset * 2} height={size * 0.15} fill="rgba(0,0,0,.2)" />
    </svg>
  )
}

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M4 14 16 4l12 10v11a3 3 0 0 1-3 3H13l-6 4v-4H7a3 3 0 0 1-3-3z" fill="var(--navy)" />
      <path d="M11 17v3M14.5 14v9M18 16v5M21.5 17.5v2" stroke="var(--yolk)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
