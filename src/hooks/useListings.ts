'use client'

import { useQuery } from '@tanstack/react-query'

export function useListings(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams(params)
      const res = await fetch(`/api/listings?${searchParams}`)
      return res.json()
    },
  })
}
