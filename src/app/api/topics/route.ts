import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const slug = searchParams.get('slug')
    const withProgress = searchParams.get('withProgress') === 'true'

    const session = withProgress ? await getSession(request) : null

    const where: Record<string, unknown> = { isActive: true }
    if (categoryId) where.categoryId = categoryId
    if (slug) where.slug = slug

    const topics = await db.topic.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: {
          select: {
            questions: { where: { status: 'APPROVED' } },
            subtopics: { where: { isActive: true } },
          },
        },
      },
    })

    let progressMap: Record<string, { questionsAttempted: number; correctCount: number; accuracy: number }> = {}

    if (session) {
      const topicIds = topics.map((t) => t.id)
      const progressRecords = await db.topicProgress.findMany({
        where: { userId: session.userId, topicId: { in: topicIds } },
      })
      for (const p of progressRecords) {
        progressMap[p.topicId] = {
          questionsAttempted: p.questionsAttempted,
          correctCount: p.correctCount,
          accuracy: p.accuracy,
        }
      }
    }

    const result = topics.map((t) => {
      const topic: Record<string, unknown> = {
        id: t.id,
        name: t.name,
        slug: t.slug,
        description: t.description,
        icon: t.icon,
        order: t.order,
        categoryId: t.categoryId,
        category: t.category,
        questionCount: t._count.questions,
        subtopicCount: t._count.subtopics,
      }
      if (session && progressMap[t.id]) {
        topic.progress = progressMap[t.id]
      }
      return topic
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[GET /api/topics]', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memuat topik' },
      { status: 500 },
    )
  }
}
