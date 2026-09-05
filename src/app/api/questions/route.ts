import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function parseOptions(optionsStr: string): unknown[] {
  try {
    return JSON.parse(optionsStr)
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')
    const categoryId = searchParams.get('categoryId')
    const difficulty = searchParams.get('difficulty')
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const type = searchParams.get('type')
    const random = searchParams.get('random') === 'true'

    const session = await getSession(request)

    const where: Record<string, unknown> = { status: 'APPROVED' }
    if (topicId) where.topicId = topicId
    if (categoryId) where.categoryId = categoryId
    if (difficulty) {
      const d = parseInt(difficulty, 10)
      if (d >= 1 && d <= 5) where.difficulty = d
    }
    if (type) where.questionType = type

    let questions = await db.question.findMany({
      where,
      orderBy: random ? undefined : { difficulty: 'asc' },
      skip: offset,
      take: limit,
      select: {
        id: true,
        topicId: true,
        subtopicId: true,
        difficulty: true,
        questionType: true,
        question: true,
        options: true,
        correctAnswer: true,
        shortExplanation: true,
        timesAnswered: true,
        timesCorrect: true,
      },
    })

    if (random) {
      questions = fisherYatesShuffle(questions)
    }

    let correctlyAnsweredIds: Set<string> = new Set()
    if (session) {
      const questionIds = questions.map((q) => q.id)
      const correctAttempts = await db.attempt.findMany({
        where: {
          userId: session.userId,
          questionId: { in: questionIds },
          isCorrect: true,
        },
        select: { questionId: true },
      })
      correctlyAnsweredIds = new Set(correctAttempts.map((a) => a.questionId))
    }

    const result = questions.map((q) => ({
      ...q,
      options: parseOptions(q.options),
      alreadyCorrect: correctlyAnsweredIds.has(q.id),
    }))

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[GET /api/questions]', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memuat soal' },
      { status: 500 },
    )
  }
}
