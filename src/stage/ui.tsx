import { createContext, useContext, useState, type ReactNode } from 'react'

interface UI {
  specs: boolean
  setSpecs: (v: boolean) => void
  feature: string | null
  openFeature: (id: string | null) => void
}

const Ctx = createContext<UI>({ specs: false, setSpecs: () => {}, feature: null, openFeature: () => {} })

export function UIProvider({ children }: { children: ReactNode }) {
  const [specs, setSpecs] = useState(false)
  const [feature, openFeature] = useState<string | null>(null)
  return <Ctx.Provider value={{ specs, setSpecs, feature, openFeature }}>{children}</Ctx.Provider>
}

export const useUI = () => useContext(Ctx)
