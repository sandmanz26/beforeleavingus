import { useState } from 'react'
import { BANK, MEMBERS, type MemberId } from '../../data/family'
import { Btn, Spec, Stamp } from '../../components/bits'
import { Icon } from '../../components/Icon'
import { useWorld } from '../../store/world'
import { BackBar } from './Margaret'

// F-F1: shame-free recovery (P-14, S-05, J6). Her money, her choice of who
// hears about it. “Keep it to myself” is a first-class answer.

export function Happened({ onBack }: { onBack: () => void }) {
  const { w, dispatch } = useWorld()
  const [step, setStep] = useState(0)
  const [ringing, setRinging] = useState(false)

  if (step === 0)
    return (
      <div className="m-page m-soft">
        <BackBar onBack={onBack} title="" />
        <Spec ids="F-F1" />
        <Icon name="heart" size={52} className="m-closing__icon" />
        <h1 className="m-display m-display--xl">You’re not in trouble.</h1>
        <p className="m-body">The people who do this are professional criminals. Being tricked is not your fault — it happens to careful, clever people every day.</p>
        <p className="m-body">Let’s get your money stopped if we can. Nobody else will see this unless you choose.</p>
        <Btn tone="ink" big iconRight="right" onClick={() => setStep(1)}>Show me what to do</Btn>
      </div>
    )

  if (step === 1)
    return (
      <div className="m-page">
        <BackBar onBack={() => setStep(0)} title="Step 1 of 3" />
        <h1 className="m-q">Ring your bank first.</h1>
        <p className="m-body">The sooner they hear, the more they can stop.</p>
        <div className="m-bank">
          <Icon name="bank" size={36} />
          <span>
            <b>{BANK.name}</b>
            {BANK.line} · {BANK.note}
          </span>
        </div>
        <Btn tone="ink" big icon="handset" onClick={() => setRinging(true)}>
          {ringing ? 'Ringing the bank…' : `Ring ${BANK.name}`}
        </Btn>
        <p className="m-label">Say this</p>
        <div className="m-card m-card--script">
          <p className="m-card__q">“I think I’ve been tricked into sending money. Please stop the payment and freeze my card.”</p>
        </div>
        {w.pastLoss && <p className="m-body m-muted">Paid with gift cards? Ring the number on the back of each card as well.</p>}
        <Btn tone="paper" big iconRight="right" onClick={() => setStep(2)}>I’ve rung them</Btn>
      </div>
    )

  if (step === 2)
    return (
      <div className="m-page">
        <BackBar onBack={() => setStep(1)} title="Step 2 of 3" />
        <h1 className="m-q">Report it. It helps stop them.</h1>
        <div className="m-report">
          <p><b>In the US</b> FTC · 1-877-382-4357</p>
          <p><b>In the UK</b> Action Fraud · 0300 123 2040</p>
        </div>
        <p className="m-body m-muted">They’ll ask what happened. You can read them this screen’s notes, or ask someone to sit with you.</p>
        <Btn tone="paper" big iconRight="right" onClick={() => setStep(3)}>Next</Btn>
      </div>
    )

  if (step === 3)
    return (
      <div className="m-page">
        <BackBar onBack={() => setStep(2)} title="Step 3 of 3" />
        <h1 className="m-q">Would you like anyone to know?</h1>
        <p className="m-body">It’s your choice. Nobody will take over your money.</p>
        <div className="m-tell">
          {(['david', 'emma'] as MemberId[]).map((id) => (
            <button key={id} className="m-who__tile" onClick={() => { dispatch({ type: 'disclose', member: id }); setStep(4) }}>
              <Stamp id={id} size={54} />
              <span>Tell {MEMBERS[id].name}</span>
            </button>
          ))}
        </div>
        <Btn tone="paper" big onClick={() => { dispatch({ type: 'disclose', member: null }); setStep(4) }}>Keep it to myself for now</Btn>
      </div>
    )

  return (
    <div className="m-page m-soft">
      <Icon name="tick" size={56} className="m-closing__icon" />
      <h1 className="m-display m-display--xl">Thank you for doing this.</h1>
      <p className="m-body">
        {w.disclosedTo ? `${MEMBERS[w.disclosedTo].name} will ring you soon — to help, not to tell you off.` : 'You can come back to this any time. The button is always at the bottom of your home screen.'}
      </p>
      <Btn tone="ink" big onClick={onBack}>Back to home</Btn>
    </div>
  )
}
