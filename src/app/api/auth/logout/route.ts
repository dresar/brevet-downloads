import { NextRequest, NextResponse } from 'next/server'
import { getSession, deleteSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)

    // Validate session exists before deleting
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json(
        { error: 'Sesi tidak valid' },
        { status: 401 }
      )
    }

    await deleteSession(token)

    return NextResponse.json({ message: 'Berhasil logout' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat logout' },
      { status: 500 }
    )
  }
}
