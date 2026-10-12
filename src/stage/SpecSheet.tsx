import { FEATURES, GROUPS, JOBS, PROBLEMS, SCENARIOS_REF, STAGES } from '../data/prd'
import { Icon } from '../components/Icon'
import { useUI } from './ui'

// The card that opens when a spec tag is clicked.
export function SpecSheet() {
  const { feature, openFeature } = useUI()
  const f = FEATURES.find((x) => x.id === feature)
  if (!f) return null
  return (
    <aside className="spec-sheet" role="dialog" aria-label={`${f.id} ${f.name}`}>
      <button className="st-close" onClick={() => openFeature(null)} aria-label="Close">
        <Icon name="cross" size={20} />
      </button>
      <p className="spec-sheet__id">
        {f.id} · {GROUPS[f.group]}
      </p>
      <h2>{f.name}</h2>
      <p>{f.does}</p>
      <dl>
        <dt>Solves</dt>
        <dd>
          {f.problems.map((p) => (
            <span key={p}>
              <b>{p}</b> {PROBLEMS[p].name}
            </span>
          ))}
        </dd>
        <dt>Breaks the chain at</dt>
        <dd>
          {f.stages.map((t) => (
            <span key={t}>
              <b>{t}</b> {STAGES[t].name}
            </span>
          ))}
        </dd>
        <dt>Scenarios</dt>
        <dd>
          {f.scenarios.map((s) => (
            <span key={s}>
              <b>{s}</b> {SCENARIOS_REF[s]}
            </span>
          ))}
        </dd>
        {f.jobs.length > 0 && (
          <>
            <dt>Jobs</dt>
            <dd>
              {f.jobs.map((j) => (
                <span key={j}>
                  <b>{j}</b> {JOBS[j]}
                </span>
              ))}
            </dd>
          </>
        )}
        <dt>Lives on</dt>
        <dd>{f.lives.join(', ')}’s phone</dd>
      </dl>
    </aside>
  )
}
