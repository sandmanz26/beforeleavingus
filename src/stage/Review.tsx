import { useEffect } from 'react'
import { KEEP, ROAST, STILL } from '../data/roast'
import { Icon } from '../components/Icon'

// The v1 roast, in the prototype itself: what was wrong, the v1 evidence,
// and what v2 changed. Mirrors docs/ROAST.md.
export function Review({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [onClose])
  const base = import.meta.env.BASE_URL
  return (
    <div className="fm" role="dialog" aria-label="Design review">
      <div className="fm__panel rv">
        <header className="fm__head">
          <div>
            <p className="fm__eyebrow">v1 → v2 · {ROAST.length} findings · {ROAST.filter((r) => r.sev === 'Critical').length} critical</p>
            <h1>The roast</h1>
          </div>
          <button className="st-close" onClick={onClose} aria-label="Close design review">
            <Icon name="cross" size={22} />
          </button>
        </header>
        <p className="fm__lede">
          v1, reviewed against the PRD’s own bar: an 80-year-old, panicking, hands shaking. One decision per screen. Never a false reassurance. Each finding shows the v1 evidence and what v2 shipped.
        </p>
        <ol className="rv-list">
          {ROAST.map((r) => (
            <li key={r.n} className={`rv-item is-${r.sev.toLowerCase()}`}>
              {r.img ? <img src={`${base}roast/${r.img}`} alt={`v1 screenshot for finding ${r.n}`} loading="lazy" /> : <span className="rv-noimg"><Icon name="flame" size={28} /></span>}
              <div>
                <p className="rv-meta">
                  <span className="rv-sev">{r.sev}</span> #{r.n} · {r.refs}
                </p>
                <h2>{r.title}</h2>
                <p className="rv-burn">{r.burn}</p>
                <p className="rv-fix">
                  <b>v2</b> {r.fix}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div className="rv-cols">
          <section>
            <h2 className="fm__h2">Kept from v1</h2>
            <ul className="rv-bullets">{KEEP.map((k) => <li key={k}>{k}</li>)}</ul>
          </section>
          <section>
            <h2 className="fm__h2">Still not solved</h2>
            <ul className="rv-bullets">{STILL.map((k) => <li key={k}>{k}</li>)}</ul>
          </section>
        </div>
      </div>
    </div>
  )
}
