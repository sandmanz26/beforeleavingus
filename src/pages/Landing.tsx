import { Btn } from '../components/bits'
import { Icon } from '../components/Icon'
import { Logo, VoiceStamp } from '../components/Stamp'
import { Link, navigate } from '../lib/router'
import { sampleFamily, useStore } from '../lib/store'

const emma = sampleFamily()[0]
// In-page jumps: the hash belongs to the router, so sections scroll instead.
const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export function Landing() {
  const { account } = useStore()
  const start = () => navigate(account ? '/app' : '/signup')
  return (
    <div className="site">
      <header className="site-nav">
        <Link to="/" className="brand" aria-label="KinVoice home">
          <Logo size={30} />
          <span>kinvoice</span>
        </Link>
        <nav className="site-nav__links" aria-label="Sections">
          <button onClick={() => jump('how')}>How it works</button>
          <button onClick={() => jump('checks')}>What we check</button>
          <button onClick={() => jump('privacy')}>Privacy</button>
          <button onClick={() => jump('faq')}>FAQ</button>
        </nav>
        <div className="site-nav__cta">
          {account ? (
            <Btn tone="ink" onClick={() => navigate('/app')}>Open KinVoice</Btn>
          ) : (
            <>
              <Link to="/signin" className="site-nav__signin">Sign in</Link>
              <Btn tone="yolk" onClick={() => navigate('/signup')}>Create account</Btn>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero__copy">
            <p className="eyebrow">Protection from AI voice scams, for families</p>
            <h1 className="display">They can copy a voice. They can’t copy your family.</h1>
            <p className="lede">
              KinVoice learns how you and your family sound and how you talk. When a call or voice note doesn’t feel right, check it in seconds — before anyone sends a penny.
            </p>
            <div className="hero__cta">
              <Btn tone="yolk" big onClick={start}>Create your KinVoice</Btn>
              <button className="link" onClick={() => jump('how')}>See how it works</button>
            </div>
            <ul className="hero__trust">
              <li><Icon name="lock" size={18} /> Your recordings never leave your device</li>
              <li><Icon name="heart" size={18} /> Nobody is added without their consent</li>
            </ul>
          </div>

          <figure className="hero__demo" aria-label="Example of a KinVoice check">
            <div className="demo-card">
              <div className="demo-card__head">
                <VoiceStamp member={emma} size={58} />
                <div>
                  <small>Voice note · 0:35 · says it’s Emma</small>
                  <b>“Mum, I crashed the car — I need bail money now…”</b>
                </div>
              </div>
              <div className="demo-wave" aria-hidden>
                {Array.from({ length: 46 }, (_, i) => (
                  <span key={i} style={{ height: `${22 + Math.abs(Math.sin(i * 0.9) * 62 + Math.sin(i * 0.31) * 16)}%` }} />
                ))}
              </div>
              <div className="verdict verdict--likely-fake">
                <Icon name="cross" size={26} stroke={3} />
                <div>
                  <b>This is likely fake.</b>
                  <span>It doesn’t sound like Emma, and it follows a scam script.</span>
                </div>
              </div>
              <ul className="demo-signals">
                <li><span>Voice match with Emma</span><b>41%</b></li>
                <li><span>AI voice clues</span><b>4 of 4</b></li>
                <li><span>Scam signs</span><b>Bail · courier · secrecy</b></li>
              </ul>
            </div>
          </figure>
        </section>

        <section className="facts" aria-label="Why this matters">
          <p><b>3 seconds</b> of audio from social media is enough to copy a voice.</p>
          <p><b>$2.4 billion</b> lost to fraud by Americans over 60 in 2024 — four times 2020.<small>FTC</small></p>
          <p><b>31%</b> of people got a deepfake call in the past year. 15% weren’t sure.<small>Hiya, 2026</small></p>
        </section>

        <section className="how" id="how">
          <h2 className="h2">Set up once. Check in seconds.</h2>
          <ol className="steps">
            <li>
              <span className="steps__n">1</span>
              <h3>Teach KinVoice your voice</h3>
              <p>Five short recordings — about two minutes. Then add how you talk: what you call your mum, how you say hello.</p>
            </li>
            <li>
              <span className="steps__n">2</span>
              <h3>Bring your family in</h3>
              <p>Invite the people a scammer would pretend to be. Each person records their own voice, with their own consent.</p>
            </li>
            <li>
              <span className="steps__n">3</span>
              <h3>Check anything that sounds off</h3>
              <p>Upload a voice note or record a call on speaker. KinVoice tells you if it sounds like them — and what to do next.</p>
            </li>
          </ol>
        </section>

        <section className="checks" id="checks">
          <h2 className="h2">Four things a clone gets wrong</h2>
          <div className="checks__grid">
            <article>
              <Icon name="voicenote" size={30} />
              <h3>The voice</h3>
              <p>Pitch, tone and rhythm, matched against the voiceprint of the person it claims to be.</p>
            </article>
            <article>
              <Icon name="people" size={30} />
              <h3>The words</h3>
              <p>A clone gets the sound, not the habits. Emma says “Hiya Mum”, never “Hello Mom”.</p>
            </article>
            <article>
              <Icon name="ear" size={30} />
              <h3>AI clues</h3>
              <p>Flat pitch, no breaths, perfect silence between words — small tells of generated speech.</p>
            </article>
            <article>
              <Icon name="hush" size={30} />
              <h3>The scam script</h3>
              <p>Urgency, secrecy, a new number, gift cards or a courier. The story scammers always tell.</p>
            </article>
          </div>
          <p className="honest">
            <Icon name="info" size={22} />
            KinVoice gives you a strong signal, not a guarantee. When money is involved, it always sends you back to your family — on a number you already know.
          </p>
        </section>

        <section className="privacy" id="privacy">
          <div>
            <h2 className="h2">Your voice stays yours.</h2>
            <p className="lede">A voiceprint is a set of numbers about how you sound — not a recording, and it can’t be turned back into your voice.</p>
          </div>
          <ul>
            <li><Icon name="lock" size={22} /> Recordings are analysed in your browser and never uploaded.</li>
            <li><Icon name="cross" size={22} /> KinVoice never makes a copy of anyone’s voice. Not for any reason.</li>
            <li><Icon name="heart" size={22} /> Family members are only matched after they agree, on their own.</li>
            <li><Icon name="trash" size={22} /> Pause or delete your voiceprint whenever you like.</li>
          </ul>
        </section>

        <section className="app-soon">
          <div>
            <p className="eyebrow">Coming to iPhone and Android</p>
            <h2 className="h2">Record a suspicious call. Send it to Kin.</h2>
            <p className="lede">In the KinVoice app, one tap records the call you’re on and checks it while you’re still talking. Your family can be asked to confirm on their own phones.</p>
          </div>
          <div className="phone-sketch" aria-hidden>
            <div className="phone-sketch__screen">
              <span className="phone-sketch__call">On a call · Unknown</span>
              <span className="phone-sketch__btn"><Icon name="mic" size={26} /> Send to Kin</span>
            </div>
          </div>
        </section>

        <section className="faq" id="faq">
          <h2 className="h2">Questions</h2>
          {[
            ['Can KinVoice say for certain who’s speaking?', 'No tool can — voices can be copied well. KinVoice tells you how closely a voice matches, what doesn’t fit, and what to do. For anything involving money, confirm with the person directly.'],
            ['Do my recordings get uploaded?', 'No. In this web version every recording is analysed inside your browser. Only the voiceprint numbers are kept, on your device.'],
            ['Who should I invite?', 'The people a scammer would pretend to be — usually children and grandchildren — and the people most likely to get the call, often parents and grandparents.'],
            ['What if I get a call right now?', 'Hang up and call them back on the number you already have. If you can, put the call on speaker and record it with KinVoice first.'],
            ['Is it free?', 'Yes, while KinVoice is in beta.'],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}<Icon name="down" size={20} /></summary>
              <p>{a}</p>
            </details>
          ))}
        </section>

        <section className="final-cta">
          <h2 className="display display--m">Two minutes now. Peace of mind later.</h2>
          <Btn tone="yolk" big onClick={start}>Create your KinVoice</Btn>
        </section>
      </main>

      <footer className="site-foot">
        <span className="brand"><Logo size={22} /> kinvoice</span>
        <span>Web beta · Your data stays in this browser</span>
        <Link to="/signin">Sign in</Link>
      </footer>
    </div>
  )
}
