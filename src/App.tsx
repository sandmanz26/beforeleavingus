import { WorldProvider } from './store/world'
import { Shell } from './shell/Shell'

export function App() {
  return (
    <WorldProvider>
      <Shell />
    </WorldProvider>
  )
}
