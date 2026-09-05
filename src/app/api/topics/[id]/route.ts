import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const topic = await db.topic.findUnique({
      where: { id, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subtopics: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { questions: { where: { status: 'APPROVED' } } },
            },
          },
        },
        _count: {
          select: { questions: { where: { status: 'APPROVED' } } },
        },
      },
    })

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Topik tidak ditemukan' },
        { status: 404 },
      )
    }

    const result = {
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
      icon: topic.icon,
      order: topic.order,
      categoryId: topic.categoryId,
      category: topic.category,
      questionCount: topic._count.questions,
      subtopics: topic.subtopics.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        order: s.order,
        questionCount: s._count.questions,
      })),
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[GET /api/topics/[id]]', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memuat topik' },
      { status: 500 },
    )
  }
}
