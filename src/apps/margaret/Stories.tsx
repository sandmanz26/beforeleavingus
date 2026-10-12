import { useState } from 'react'
import { Btn } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { BackBar } from './Margaret'

// F-E1: what this is about, in four plain pages (P-08). One a week, at most.
const PAGES = [
  { icon: 'mic', head: 'Computers can copy a voice.', body: 'A few seconds of a video online is enough to make a voice that sounds like Emma or David.' },
  { icon: 'handset', head: 'Tricksters use it to sound like family.', body: 'They ring with a story — an accident, an arrest — and ask for money quickly, and secretly.' },
  { icon: 'people', head: 'They can copy a voice. Not your family.', body: 'They don’t know what you call each other, or the old blue car. And they can’t answer on Emma’s phone.' },
  { icon: 'kettle', head: 'So: the yellow button, then the kettle.', body: 'Tap it when anyone asks for help or money. Your family will be asked on their own phones.' },
]

export function Stories({ onBack }: { onBack: () => void }) {
  const [i, setI] = useState(0)
  const p = PAGES[i]
  return (
    <div className="m-page m-soft">
      <BackBar onBack={onBack} title={`${i + 1} of ${PAGES.length}`} />
      <div className="m-story">
        <Icon name={p.icon} size={64} stroke={2.2} />
        <h1 className="m-display m-display--xl">{p.head}</h1>
        <p className="m-body">{p.body}</p>
      </div>
      <div className="m-story__dots" aria-hidden>
        {PAGES.map((_, n) => <span key={n} className={n === i ? 'is-on' : ''} />)}
      </div>
      {i < PAGES.length - 1 ? (
        <Btn tone="ink" big iconRight="right" onClick={() => setI(i + 1)}>Next</Btn>
      ) : (
        <Btn tone="ink" big onClick={onBack}>Got it</Btn>
      )}
    </div>
  )
}
