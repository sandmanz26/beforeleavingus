import { WorldProvider } from './store/world'
import { Stage } from './stage/Stage'
import { UIProvider } from './stage/ui'

export function App() {
  return (
    <WorldProvider>
      <UIProvider>
        <Stage />
      </UIProvider>
    </WorldProvider>
  )
}
