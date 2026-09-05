import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, sanitizeUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      )
    }

    // Include profile data if available
    const profile = await db.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    // Include progress if available
    const progress = await db.userProgress.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json({
      user: sanitizeUser(session.user),
      profile,
      progress,
    })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
