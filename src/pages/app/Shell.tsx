import type { ReactNode } from 'react'
import { Icon } from '../../components/Icon'
import { Logo, VoiceStamp } from '../../components/Stamp'
import { Link } from '../../lib/router'
import { me, useStore } from '../../lib/store'

const NAV = [
  { to: '/app', label: 'Home', icon: 'home' },
  { to: '/app/check', label: 'Check a voice', icon: 'ear', primary: true },
  { to: '/app/family', label: 'Family', icon: 'people' },
  { to: '/app/history', label: 'History', icon: 'list' },
  { to: '/app/voice', label: 'My voice', icon: 'voicenote' },
]

export function Shell({ path, children }: { path: string; children: ReactNode }) {
  const { data, account } = useStore()
  const self = data ? me(data) : null
  const on = (to: string) => (to === '/app' ? path === '/app' : path.startsWith(to))
  return (
    <div className="shell">
      <aside className="side">
        <Link to="/app" className="brand"><Logo size={28} /><span>kinvoice</span></Link>
        <nav aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={`side__link${on(n.to) ? ' is-on' : ''}${n.primary ? ' side__link--primary' : ''}`} aria-current={on(n.to) ? 'page' : undefined}>
              <Icon name={n.icon} size={22} /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="side__foot">
          <Link to="/app/help" className={`side__link side__link--quiet${on('/app/help') ? ' is-on' : ''}`}><Icon name="buoy" size={20} /> Something happened?</Link>
          <Link to="/app/settings" className={`side__me${on('/app/settings') ? ' is-on' : ''}`}>
            {self && <VoiceStamp member={self} size={30} />}
            <span><b>{account?.name}</b><small>Settings</small></span>
          </Link>
        </div>
      </aside>

      <header className="topbar">
        <Link to="/app" className="brand"><Logo size={26} /><span>kinvoice</span></Link>
        <Link to="/app/settings" className="topbar__me" aria-label="Settings">
          {self && <VoiceStamp member={self} size={28} />}
        </Link>
      </header>

      <main className="main">{children}</main>

      <nav className="tabbar" aria-label="Main">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className={`tabbar__link${on(n.to) ? ' is-on' : ''}${n.primary ? ' tabbar__link--primary' : ''}`} aria-current={on(n.to) ? 'page' : undefined}>
            <Icon name={n.icon} size={n.primary ? 26 : 22} />
            <span>{n.primary ? 'Check' : n.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export function PageHead({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="page-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="display display--s">{title}</h1>
      </div>
      {children}
    </header>
  )
}
