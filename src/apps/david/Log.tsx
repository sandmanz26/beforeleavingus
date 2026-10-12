import { Icon } from '../../components/Icon'
import { MeButton } from '../../shell/Shell'
import { quietCount, useWorld } from '../../store/world'
import type { LogEntry } from '../../store/types'

const ICON: Record<LogEntry['kind'], string> = {
  attempt: 'handset',
  quiet: 'quiet',
  practice: 'play',
  consent: 'lock',
  setup: 'calendar',
  message: 'voicenote',
}

// F-A2: everything that happened, including what we deliberately didn't
// interrupt anyone about.
export function Log() {
  const { w } = useWorld()
  return (
    <div className="d-page">
      <header className="d-head">
        <div>
          <p className="d-eyebrow">Everything, in order</p>
          <h1 className="d-title">Log</h1>
        </div>
        <MeButton />
      </header>
      <section className="d-calm">
        <Icon name="quiet" size={28} />
        <div>
          <h2>{quietCount(w)} calls screened quietly today</h2>
          <p>Sales calls and robocalls. Nobody was alerted — that’s on purpose. Alerts only happen when someone claims to be family.</p>
        </div>
      </section>
      <ol className="d-log">
        {w.log.map((l) => (
          <li key={l.id} className={`is-${l.kind}`}>
            <span className="d-log__icon"><Icon name={ICON[l.kind]} size={20} /></span>
            <div>
              <small>{l.at}</small>
              <b>{l.title}</b>
              {l.detail && <p>{l.detail}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
