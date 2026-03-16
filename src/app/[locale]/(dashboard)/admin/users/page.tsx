import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Users, Search } from 'lucide-react'
import Link from 'next/link'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

const ROLE_TABS = [
  { label: 'All', value: '' },
  { label: 'Landlord', value: 'landlord' },
  { label: 'Tenant', value: 'tenant' },
  { label: 'Agent', value: 'agent' },
  { label: 'Admin', value: 'admin' },
  { label: 'Estate Manager', value: 'estate_manager' },
]

const ROLE_BADGE: Record<string, string> = {
  landlord: 'bg-yellow-50 text-yellow-800',
  tenant: 'bg-teal-50 text-teal-800',
  agent: 'bg-orange-50 text-orange-800',
  admin: 'bg-red-50 text-red-700',
  estate_manager: 'bg-blue-50 text-blue-800',
}

export default async function AdminUsersPage({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { q?: string; role?: string }
}) {
  const clerkUserId = await getAuthUserId()
  if (!clerkUserId) redirect(`/${params.locale}/sign-in`)

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)
  if (dbUser.role !== 'admin') redirect(`/${params.locale}/${dbUser.role === 'estate_manager' ? 'estate-manager' : dbUser.role}`)

  const q = searchParams.q?.trim() ?? ''
  const roleFilter = searchParams.role ?? ''

  const users = await prisma.user.findMany({
    where: {
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      avatarUrl: true,
      isActive: true,
      isBanned: true,
      createdAt: true,
    },
  })

  const prefix = `/${params.locale}/admin`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Showing {users.length} user{users.length !== 1 ? 's' : ''}
          {roleFilter ? ` · ${roleFilter}` : ''}
          {q ? ` · "${q}"` : ''}
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search bar */}
        <form method="GET" className="relative flex-1 max-w-sm">
          <input type="hidden" name="role" value={roleFilter} />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email…"
            className="w-full rounded-lg border bg-white py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-red-500/30"
          />
        </form>

        {/* Role tabs */}
        <div className="flex flex-wrap gap-1">
          {ROLE_TABS.map((tab) => {
            const params_str = new URLSearchParams()
            if (q) params_str.set('q', q)
            if (tab.value) params_str.set('role', tab.value)
            const active = roleFilter === tab.value
            return (
              <Link
                key={tab.value}
                href={`${prefix}/users?${params_str.toString()}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>

      {users.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-2 text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.fullName ?? ''}
                            className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-semibold text-red-600">
                            {u.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{u.fullName}</p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.isBanned ? (
                        <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          Banned
                        </span>
                      ) : u.isActive ? (
                        <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
