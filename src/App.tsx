import { useEffect } from 'react'
import { Landing } from './pages/Landing'
import { Auth } from './pages/Auth'
import { Setup } from './pages/Setup'
import { Shell } from './pages/app/Shell'
import { Home } from './pages/app/Home'
import { Check } from './pages/app/Check'
import { Result } from './pages/app/Result'
import { Family, MemberPage } from './pages/app/Family'
import { History, Help, Join, MyVoice, Pause, Settings } from './pages/app/Misc'
import { matchPath, navigate, useRoute } from './lib/router'
import { StoreProvider, useStore } from './lib/store'

function Routes() {
  const path = useRoute()
  const { account } = useStore()
  const needsAuth = path.startsWith('/app') || path.startsWith('/setup')

  useEffect(() => {
    if (needsAuth && !account) navigate('/signin')
    if (account && (path === '/signin' || path === '/signup')) navigate('/app')
  }, [needsAuth, account, path])

  if (path === '/') return <Landing />
  if (path === '/signup') return <Auth mode="signup" />
  if (path === '/signin') return <Auth mode="signin" />
  let p: Record<string, string> | null
  if ((p = matchPath('/join/:id', path))) return <Join id={p.id} />
  if (!account) return null
  if (path === '/setup') return <Setup />
  if ((p = matchPath('/setup/:id', path))) return <Setup memberId={p.id} />

  let page
  if (path === '/app') page = <Home />
  else if (path === '/app/check') page = <Check />
  else if ((p = matchPath('/app/check/:id', path))) page = <Result id={p.id} />
  else if (path === '/app/family') page = <Family />
  else if ((p = matchPath('/app/family/:id', path))) page = <MemberPage id={p.id} />
  else if (path === '/app/history') page = <History />
  else if (path === '/app/voice') page = <MyVoice />
  else if (path === '/app/pause') page = <Pause />
  else if (path === '/app/help') page = <Help />
  else if (path === '/app/settings') page = <Settings />
  else page = <div className="page"><h1 className="display display--s">Page not found</h1></div>
  return <Shell path={path}>{page}</Shell>
}

export function App() {
  return (
    <StoreProvider>
      <Routes />
    </StoreProvider>
  )
}
