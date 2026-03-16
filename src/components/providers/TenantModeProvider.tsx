'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

export type TenantMode = 'rent' | 'buy' | 'shortlet' | 'share'

interface TenantModeContextValue {
  mode: TenantMode
  setMode: (mode: TenantMode) => void
}

const TenantModeContext = createContext<TenantModeContextValue>({
  mode: 'rent',
  setMode: () => {},
})

export function useTenantMode() {
  return useContext(TenantModeContext)
}

export default function TenantModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<TenantMode>('rent')

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('propati-tenant-mode') as TenantMode | null
    if (stored && ['rent', 'buy', 'shortlet', 'share'].includes(stored)) {
      setModeState(stored)
    }
  }, [])

  const setMode = useCallback((m: TenantMode) => {
    setModeState(m)
    localStorage.setItem('propati-tenant-mode', m)
  }, [])

  return (
    <TenantModeContext.Provider value={{ mode, setMode }}>
      {children}
    </TenantModeContext.Provider>
  )
}
