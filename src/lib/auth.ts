import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export async function getDbUser() {
  const { userId } = auth()
  if (!userId) return null

  return prisma.user.findUnique({
    where: { clerkUserId: userId },
  })
}

export async function requireDbUser() {
  const user = await getDbUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function requireRole(...roles: string[]) {
  const user = await requireDbUser()
  if (!roles.includes(user.role)) {
    throw new Error(`Forbidden: requires role ${roles.join(' or ')}`)
  }
  return user
}
