import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSession, sanitizeUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body as {
      email?: string
      password?: string
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Fetch or create profile & progress
    let profile = await db.userProfile.findUnique({ where: { userId: user.id } })
    if (!profile) {
      profile = await db.userProfile.create({ data: { userId: user.id } })
    }

    let progress = await db.userProgress.findUnique({ where: { userId: user.id } })
    if (!progress) {
      progress = await db.userProgress.create({ data: { userId: user.id } })
    }

    // Create session
    const session = await createSession(user.id)

    return NextResponse.json({
      success: true,
      user: sanitizeUser(user),
      profile,
      progress,
      token: session.token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    )
  }
}
