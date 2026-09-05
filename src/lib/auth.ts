import { db } from '@/lib/db'
import type { User, Session } from '@prisma/client'

import crypto from 'crypto'

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `pbkdf2:${salt}:${hash}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false

  try {
    if (storedHash.startsWith('pbkdf2:')) {
      const parts = storedHash.split(':')
      const salt = parts[1]
      const hash = parts[2]
      if (!salt || !hash) return false
      const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(checkHash, 'hex'))
    }

    if (storedHash.startsWith('scrypt:') || storedHash.includes(':')) {
      const parts = storedHash.startsWith('scrypt:') ? storedHash.replace('scrypt:', '').split(':') : storedHash.split(':')
      const salt = parts[0]
      const key = parts[1]
      if (!salt || !key) return false
      const derivedKey = crypto.scryptSync(password, salt, 64)
      return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey)
    }

    if (password === storedHash) {
      return true
    }
  } catch (err) {
    console.error('Verify password error:', err)
  }

  return false
}

export function generateSessionToken(): string {
  return crypto.randomUUID()
}

export interface SessionWithUser extends Session {
  user: User
}

export async function getSession(request: Request): Promise<SessionWithUser | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  if (!token) {
    return null
  }

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session) {
    return null
  }

  if (new Date() > session.expiresAt) {
    await db.session.delete({ where: { id: session.id } })
    return null
  }

  return session as SessionWithUser
}

export async function createSession(userId: string): Promise<Session> {
  const token = generateSessionToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days expiry

  return db.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })
}

export async function deleteSession(token: string): Promise<void> {
  await db.session.deleteMany({ where: { token } })
}

export async function checkAdmin(request: Request): Promise<boolean> {
  const session = await getSession(request)
  return session?.user.role === 'ADMIN'
}

export function sanitizeUser(user: User) {
  const { password: _, ...safeUser } = user
  return safeUser
}

export const SESSION_DURATION_DAYS = 30
