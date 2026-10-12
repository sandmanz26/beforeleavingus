import { MEMBERS } from '../../data/family'
import { Dot, Stamp } from '../../components/bits'
import { elapsed, useWorld } from '../../store/world'
import type { Incident } from '../../store/types'

// F-C3 + F-C5: who in the family is being asked, live. Never silent:
// when nobody has answered, it says so calmly.
export function FamilyStrip({ inc }: { inc: Incident }) {
  const { w } = useWorld()
  if (!inc.claimed) return null
  const lastSent = Math.max(...inc.asks.map((a) => a.sentAt))
  const exhausted =
    inc.asks.length >= inc.tree.length &&
    !inc.asks.some((a) => a.state === 'answered' && a.reply === 'calling') &&
    w.now - lastSent >= w.settings.escalateAfterSec * 1000
  return (
    <section className="m-strip" aria-live="polite">
      <h2 className="m-strip__title">Your family</h2>
      <ul>
        {inc.asks.map((a) => {
          const m = MEMBERS[a.member]
          const away = w.away[a.member]
          let text = ''
          if (a.state === 'away') text = `${away?.label ?? 'Away'} until ${away?.until ?? 'later'}. Skipped.`
          else if (a.state === 'asking') text = `Asking now… ${elapsed(a.sentAt, w.now)}`
          else if (a.reply === 'calling') text = 'Is ringing you now.'
          else if (a.reply === 'unsure') text = 'Can’t reach them either.'
          else text = 'Answered.'
          return (
            <li key={a.member} className={`m-strip__row is-${a.state}`}>
              <Stamp id={a.member} size={30} dim={a.state === 'away'} />
              <span className="m-strip__name">{m.name}</span>
              <span className="m-strip__state">
                {a.state === 'asking' && <Dot pulse />} {text}
              </span>
            </li>
          )
        })}
      </ul>
      {exhausted && <p className="m-strip__none">Nobody has answered yet. That’s normal — they may be busy. Don’t send anything.</p>}
    </section>
  )
}
