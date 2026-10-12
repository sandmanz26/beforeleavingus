// Hand-drawn icon set for KinVoice. 32×32 grid, 2.4 stroke, round joins.
// Drawn for the household objects this product borrows from — kettle,
// handset, recipe card, doorstep — rather than generic UI glyphs.

import type { CSSProperties } from 'react'

const P: Record<string, string> = {
  kettle:
    'M8.6 26.5 10.4 14a2 2 0 0 1 2-1.7h7.2a2 2 0 0 1 2 1.7l1.8 12.5M7 26.5h18M13.2 12.3v-1.6a2.3 2.3 0 0 1 2.3-2.3h1a2.3 2.3 0 0 1 2.3 2.3v1.6M16 8.4V6.8M22.1 15.2c3.4.2 4.9 1.9 4.6 4.6-.3 2.4-1.9 3.6-4.1 3.7M10.3 18.2 5.2 14l.9-1.4 4.6 2.1',
  handset:
    'M9.3 4.8h3.3l2 6-3 2.4c1.6 3.6 4.4 6.4 8 8l2.4-3 6 2v3.3a3 3 0 0 1-3 3C14.2 26.5 5.5 17.8 5.5 7.8a3 3 0 0 1 3-3z',
  ring: 'M19 5.5a8 8 0 0 1 7.5 7.5M19 10a3.6 3.6 0 0 1 3 3',
  people:
    'M11 14.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2zM22.5 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4.5 25.5c0-4 2.9-7 6.5-7s6.5 3 6.5 7M19 18.3c.9-.5 2-.8 3.4-.8 3 0 5.1 2.5 5.1 6',
  card: 'M6.5 7.5h19a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-19a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2zM13.2 13.4a2.8 2.8 0 1 1 4 2.5c-.8.4-1.2 1-1.2 1.8v.4M16 21.2v.1',
  voicenote:
    'M7 6.5h18a2.5 2.5 0 0 1 2.5 2.5v10a2.5 2.5 0 0 1-2.5 2.5h-9.5L10 26v-4.5H7A2.5 2.5 0 0 1 4.5 19V9A2.5 2.5 0 0 1 7 6.5zM10.5 12.5v3M13.8 10.5v7M17.2 12v4M20.6 11v6',
  bank: 'M4.5 12.5 16 5.5l11.5 7zM8 15.5v7.5M13 15.5v7.5M19 15.5v7.5M24 15.5v7.5M5.5 23h21M4 26.5h24',
  gift: 'M5.5 10.5h21a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5h-21A1.5 1.5 0 0 1 4 23V12a1.5 1.5 0 0 1 1.5-1.5zM12 10.5v14M12 10.5c-1.3-3.3-5.4-3.4-5-1 .3 1.6 3 1.5 5 1zM12 10.5c1.3-3.3 5.4-3.4 5-1-.3 1.6-3 1.5-5 1zM16.5 17.5h7',
  coin: 'M16 27a11 11 0 1 0 0-22 11 11 0 0 0 0 22zM13 10.5v11M13 10.5h4.2a2.6 2.6 0 0 1 0 5.2H13M13 15.7h4.7a2.9 2.9 0 0 1 0 5.8H13M15 8.8v1.7M15 21.5v1.7',
  door: 'M9 27.5V5.8A1.3 1.3 0 0 1 10.3 4.5h11.4A1.3 1.3 0 0 1 23 5.8v21.7M5 27.5h22M19.3 16.5v.1M12.5 9h7v5h-7z',
  transfer: 'M5.5 11h20M20.5 6l5 5-5 5M26.5 21h-20M11.5 16l-5 5 5 5',
  plane:
    'M27.2 16c0-1.2-1-2-2.2-2h-5.6L13.6 5h-2.5l3 9H8.4L6.2 11H4.2l1 5-1 5h2l2.2-3h5.7l-3 9h2.5l5.8-9H25c1.2 0 2.2-.8 2.2-2z',
  clock: 'M16 27a11 11 0 1 0 0-22 11 11 0 0 0 0 22zM16 9.5V16l4.5 3',
  hush: 'M7 6.5h18A2.5 2.5 0 0 1 27.5 9v10a2.5 2.5 0 0 1-2.5 2.5h-9.5L10 26v-4.5H7A2.5 2.5 0 0 1 4.5 19V9A2.5 2.5 0 0 1 7 6.5zM6 26.5 26.5 5',
  ear: 'M10.5 13a6.3 6.3 0 1 1 11.9 2.9c-1.3 2.1-3.4 2.9-3.4 5.6a3.6 3.6 0 0 1-6.5 2.1M14.3 13.2a2.6 2.6 0 0 1 4.9-1.2',
  tick: 'M6.5 16.8 12.8 23 25.5 9.5',
  cross: 'M9 9l14 14M23 9 9 23',
  right: 'M6 16h19.5M18.5 9l7 7-7 7',
  left: 'M26 16H6.5M13.5 9l-7 7 7 7',
  chevron: 'M12.5 8l8 8-8 8',
  down: 'M8 12.5l8 8 8-8',
  up: 'M8 19.5l8-8 8 8',
  bell: 'M9 21.5V15a7 7 0 0 1 14 0v6.5l2 2.5H7zM13.5 27a2.6 2.6 0 0 0 5 0',
  quiet: 'M9 21.5V15a7 7 0 0 1 11.3-5.5M23 14.5v7l2 2.5H11M13.5 27a2.6 2.6 0 0 0 5 0M5.5 26.5l21-21',
  sliders: 'M5.5 10h21M5.5 22h21M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM21 25a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  tree: 'M16 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8 27.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM24 27.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 10.5V15M8 21.5V18h16v3.5M16 15v3',
  book: 'M16 9c-3-2-7-2.5-11-2v17c4-.5 8 0 11 2 3-2 7-2.5 11-2V7c-4-.5-8 0-11 2zM16 9v17',
  buoy: 'M16 27a11 11 0 1 0 0-22 11 11 0 0 0 0 22zM16 21a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM8.2 8.2l4.3 4.3M19.5 19.5l4.3 4.3M23.8 8.2l-4.3 4.3M12.5 19.5l-4.3 4.3',
  heart: 'M16 26C9.5 21.6 5 17.6 5 12.8A5.3 5.3 0 0 1 16 10a5.3 5.3 0 0 1 11 2.8c0 4.8-4.5 8.8-11 13.2z',
  eye: 'M3.5 16C7 10.2 11 7.5 16 7.5S25 10.2 28.5 16C25 21.8 21 24.5 16 24.5S7 21.8 3.5 16zM16 20a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  eyeoff: 'M3.5 16C7 10.2 11 7.5 16 7.5S25 10.2 28.5 16C25 21.8 21 24.5 16 24.5S7 21.8 3.5 16zM16 20a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5.5 26.5l21-21',
  mic: 'M16 18.5a4 4 0 0 0 4-4v-6a4 4 0 0 0-8 0v6a4 4 0 0 0 4 4zM8.5 14.5a7.5 7.5 0 0 0 15 0M16 22v5M12 27h8',
  play: 'M11 7.5v17l14-8.5z',
  pencil: 'M6 26l1.5-6L21 6.5a2.1 2.1 0 0 1 3 0L25.5 8a2.1 2.1 0 0 1 0 3L12 24.5zM18.5 9l4.5 4.5',
  plus: 'M16 7v18M7 16h18',
  trash: 'M6.5 9h19M13 9V6.5h6V9M9 9l1.2 16.5h11.6L23 9',
  footprint:
    'M11.5 13.5c-2.6 0-4 3-4 7 0 3.5 1.6 6 4 6s3.7-2 3.6-4.6c-.1-3.5-.7-8.4-3.6-8.4zM8.5 9.8v.1M11.4 8.2v.1M14.4 9.2v.1M20.5 12.5a6 6 0 0 1 0 8.5M24 9a10.5 10.5 0 0 1 0 15.5',
  home: 'M5 15 16 6l11 9M8.5 12.5V26h15V12.5M13.5 26v-6h5v6',
  list: 'M11 9h15M11 16h15M11 23h15M6 9v.1M6 16v.1M6 23v.1',
  calendar: 'M6.5 7.5h19a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5h-19A1.5 1.5 0 0 1 5 25V9a1.5 1.5 0 0 1 1.5-1.5zM5 13h22M11 4.5v5M21 4.5v5',
  undo: 'M8.5 12.5A9 9 0 1 1 7 19M8.5 6v6.5H15',
  invite: 'M13 14.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM4.5 26.5c0-4.7 3.8-8 8.5-8 2 0 3.8.6 5.2 1.6M24 17v8M20 21h8',
  info: 'M16 27a11 11 0 1 0 0-22 11 11 0 0 0 0 22zM16 15v7M16 10.5v.1',
  lock: 'M9 14.5h14a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H9A1.5 1.5 0 0 1 7.5 25v-9A1.5 1.5 0 0 1 9 14.5zM11 14.5v-4a5 5 0 0 1 10 0v4',
  pause: 'M11.5 8v16M20.5 8v16',
  map: 'M4.5 8.5 11.5 6l9 3 7-2.5v17l-7 2.5-9-3-7 2.5zM11.5 6v17M20.5 9v17',
  flame: 'M16 27c-4.5 0-7.5-3-7.5-7 0-4.5 4-6.5 4.5-11 3 2 4 4.5 4 6.5 1-1 1.8-2.3 2-3.5 2.3 1.8 4.5 4.5 4.5 8 0 4-3 7-7.5 7z',
}

export type IconName = keyof typeof P

export function Icon({ name, size = 28, stroke = 2.4, style, className, label }: {
  name: IconName | string
  size?: number
  stroke?: number
  style?: CSSProperties
  className?: string
  label?: string
}) {
  const d = P[name] ?? P.info
  const filled = name === 'play'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={d} />
    </svg>
  )
}

// The incoming-call glyph: handset plus ring arcs.
export function RingingIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={P.handset} />
      <path d={P.ring} />
    </svg>
  )
}
