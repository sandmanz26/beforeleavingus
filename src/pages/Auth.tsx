import { useState, type FormEvent } from 'react'
import { Btn } from '../components/bits'
import { Logo } from '../components/Stamp'
import { Link, navigate } from '../lib/router'
import { useStore } from '../lib/store'

export function Auth({ mode }: { mode: 'signup' | 'signin' }) {
  const { signUp, signIn } = useStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const up = mode === 'signup'

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (up && name.trim().length < 2) return setErr('Please tell us your name.')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('That email doesn’t look right.')
    if (pw.length < 8) return setErr('Use at least 8 characters for your password.')
    setBusy(true)
    const problem = up ? await signUp(name, email, pw) : await signIn(email, pw)
    setBusy(false)
    if (problem) return setErr(problem)
    navigate(up ? '/setup' : '/app')
  }

  return (
    <main className="auth">
      <Link to="/" className="brand"><Logo size={30} /><span>kinvoice</span></Link>
      <form className="auth__card" onSubmit={submit} noValidate>
        <h1 className="display display--s">{up ? 'Create your KinVoice' : 'Welcome back'}</h1>
        <p className="muted">{up ? 'Next, you’ll teach KinVoice your voice. It takes about two minutes.' : 'Sign in to check a voice or manage your family.'}</p>
        {up && (
          <label className="field">
            Your name
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Sarah Hale" />
          </label>
        )}
        <label className="field">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" />
        </label>
        <label className="field">
          Password
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={up ? 'new-password' : 'current-password'} placeholder="At least 8 characters" />
        </label>
        {err && <p className="form-error" role="alert">{err}</p>}
        <Btn tone={up ? 'yolk' : 'ink'} big type="submit" disabled={busy}>{busy ? 'One moment…' : up ? 'Create account' : 'Sign in'}</Btn>
        <p className="auth__switch">
          {up ? <>Already have an account? <Link to="/signin">Sign in</Link></> : <>New to KinVoice? <Link to="/signup">Create an account</Link></>}
        </p>
      </form>
      <p className="auth__note">Web beta: your account and data are stored in this browser only.</p>
    </main>
  )
}
