'use client'

import { useUser } from '@clerk/nextjs'

export function useUserRole() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role as string | undefined
  return { role: role ?? 'tenant', isLoaded: !!user }
}
