import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { topics: { where: { isActive: true } } },
        },
      },
    })

    const result = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      order: cat.order,
      topicCount: cat._count.topics,
    }))

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[GET /api/categories]', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memuat kategori' },
      { status: 500 },
    )
  }
}
