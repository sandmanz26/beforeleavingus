import { useEffect, useState } from 'react'
import { FEATURES, GROUPS, PROBLEMS, SCENARIOS_REF, STAGES } from '../data/prd'
import { Icon } from '../components/Icon'
import { useWorld } from '../store/world'
import { useUI } from './ui'

// PM view: every feature traced to the PRD. Three lenses — the attack
// chain, the problem list, and the scenarios.
export function FeatureMap({ onClose }: { onClose: () => void }) {
  const [lens, setLens] = useState<'chain' | 'problems' | 'features'>('chain')
  const { openFeature } = useUI()
  const { dispatch } = useWorld()

  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [onClose])

  const chip = (id: string) => (
    <button key={id} className="fm-chip" onClick={() => openFeature(id)} title={FEATURES.find((f) => f.id === id)?.name}>
      {id}
    </button>
  )

  const uncovered = Object.keys(PROBLEMS).filter((p) => !FEATURES.some((f) => f.problems.includes(p)))

  return (
    <div className="fm" role="dialog" aria-label="Feature map">
      <div className="fm__panel">
        <header className="fm__head">
          <div>
            <p className="fm__eyebrow">{FEATURES.length} features · 14 problems · 7 attack stages · 8 scenarios</p>
            <h1>Feature map</h1>
          </div>
          <div className="k-seg" role="tablist">
            {(['chain', 'problems', 'features'] as const).map((l) => (
              <button key={l} role="tab" aria-selected={lens === l} className={lens === l ? 'is-on' : ''} onClick={() => setLens(l)}>
                {l === 'chain' ? 'Attack chain' : l === 'problems' ? 'Problems' : 'All features'}
              </button>
            ))}
          </div>
          <button className="st-close" onClick={onClose} aria-label="Close feature map">
            <Icon name="cross" size={22} />
          </button>
        </header>

        {lens === 'chain' && (
          <>
            <p className="fm__lede">The scam is a chain of seven links. KinVoice only has to break one before the money moves — the strongest breaks are at T-05 and T-06, where the scammer needs secrecy and can’t control the rest of the family.</p>
            <ol className="fm-chain">
              {Object.entries(STAGES).map(([id, s]) => {
                const fs = FEATURES.filter((f) => f.stages.includes(id))
                return (
                  <li key={id} className={fs.length > 3 ? 'is-hot' : ''}>
                    <p className="fm-chain__id">{id}</p>
                    <h3>{s.name}</h3>
                    <p className="fm-chain__do">{s.scammer}</p>
                    <p className="fm-chain__weak"><b>Weak spot</b> {s.weakness}</p>
                    <div className="fm-chain__fs">{fs.length ? fs.map((f) => chip(f.id)) : <span className="fm-none">Not prevented — assume voices leak</span>}</div>
                  </li>
                )
              })}
            </ol>
            <h2 className="fm__h2">Scenarios — play any of them</h2>
            <ul className="fm-scen">
              {Object.entries(SCENARIOS_REF).map(([id, name]) => (
                <li key={id}>
                  <button onClick={() => { dispatch({ type: 'load', id }); onClose() }}>
                    <b>{id}</b> {name}
                    <Icon name="play" size={14} />
                  </button>
                  <span>{FEATURES.filter((f) => f.scenarios.includes(id)).map((f) => chip(f.id))}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {lens === 'problems' && (
          <>
            <p className="fm__lede">{uncovered.length === 0 ? 'Every one of the 14 problems has at least one feature against it.' : `Uncovered: ${uncovered.join(', ')}`}</p>
            <table className="fm-table">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>What you’d see</th>
                  <th>Features</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(PROBLEMS).map(([id, p]) => (
                  <tr key={id}>
                    <td>
                      <b>{id}</b> {p.name}
                      <small>{p.group}</small>
                    </td>
                    <td className="fm-table__sym">{p.symptom}</td>
                    <td>{FEATURES.filter((f) => f.problems.includes(id)).map((f) => chip(f.id))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {lens === 'features' && (
          <div className="fm-groups">
            {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((g) => (
              <section key={g}>
                <h2 className="fm__h2">{GROUPS[g]}</h2>
                <ul className="fm-feats">
                  {FEATURES.filter((f) => f.group === g).map((f) => (
                    <li key={f.id}>
                      <button onClick={() => openFeature(f.id)}>
                        <span className="fm-feats__id">{f.id}</span>
                        <b>{f.name}</b>
                        <span>{f.does}</span>
                        <small>{[...f.problems, ...f.stages, ...f.scenarios].join(' · ')} — on {f.lives.join(', ')}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
