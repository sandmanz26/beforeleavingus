import { MEMBERS } from '../data/family'
import { SCENARIOS } from '../data/scenarios'
import { Segmented, Stamp } from '../components/bits'
import { Icon } from '../components/Icon'
import { useWorld } from '../store/world'

// The PRD's eight scenarios as playable stories. Loading one resets the
// family and sets the scene; the phones are then driven by hand.
export function Storyboard({ onPlay }: { onPlay?: () => void }) {
  const { w, dispatch } = useWorld()
  const clock = new Date(w.now).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  return (
    <div className="sb">
      <div className="sb__head">
        <h2>Stories from the PRD</h2>
        <p>Pick one to set the scene, then use the phones.</p>
      </div>
      <ol className="sb__list">
        <li>
          <button className={`sb-card${w.scenarioId === null ? ' is-on' : ''}`} onClick={() => { dispatch({ type: 'load', id: null }); onPlay?.() }}>
            <span className="sb-card__id">Free</span>
            <span className="sb-card__title">An ordinary Tuesday</span>
          </button>
          {w.scenarioId === null && <p className="sb-card__line">No incoming calls. Explore every screen: Margaret’s home, David’s circle and questions, Emma’s pattern and voice footprint.</p>}
        </li>
        {SCENARIOS.map((s) => {
          const on = w.scenarioId === s.id
          return (
            <li key={s.id}>
              <button className={`sb-card${on ? ' is-on' : ''}`} onClick={() => { dispatch({ type: 'load', id: s.id }); onPlay?.() }}>
                <span className="sb-card__id">{s.id}</span>
                <span className="sb-card__title">{s.title}</span>
                {on && <Icon name="undo" size={18} className="sb-card__replay" label="Replay" />}
              </button>
              {on && (
                <div className="sb-card__more">
                  <p className="sb-card__line">{s.line}</p>
                  <ol className="sb-steps">
                    {s.steps.map((st, i) => (
                      <li key={i}>
                        {st.who === 'any' ? <span className="sb-steps__any"><Icon name="eye" size={16} /></span> : <Stamp id={st.who} size={20} title={MEMBERS[st.who].name} />}
                        <span>{st.text}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="sb-refs">{s.refs.join(' · ')}</p>
                </div>
              )}
            </li>
          )
        })}
      </ol>
      <div className="sb__clock">
        <span>
          <Icon name="clock" size={18} /> <b>{clock}</b>
        </span>
        <Segmented
          label="Clock speed"
          value={w.speed}
          options={[{ v: 1, label: '1×' }, { v: 10, label: '10×' }, { v: 30, label: '30×' }]}
          onChange={(v) => dispatch({ type: 'speed', speed: v })}
        />
      </div>
      <p className="sb__note">At 10×, the 45-second phone-tree wait takes 4.5 s and the 10-minute pause takes a minute.</p>
    </div>
  )
}
