import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const question = await db.question.findUnique({
      where: { id },
      include: {
        topic: { select: { id: true, name: true, slug: true } },
        subtopic: { select: { id: true, name: true } },
      },
    })

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Soal tidak ditemukan' },
        { status: 404 },
      )
    }

    let options: unknown[] = []
    try {
      options = JSON.parse(question.options)
    } catch {
      options = []
    }

    const result = {
      id: question.id,
      topicId: question.topicId,
      subtopicId: question.subtopicId,
      categoryId: question.categoryId,
      difficulty: question.difficulty,
      questionType: question.questionType,
      question: question.question,
      options,
      correctAnswer: question.correctAnswer,
      shortExplanation: question.shortExplanation,
      fullExplanation: question.fullExplanation,
      whyCorrect: question.whyCorrect,
      whyWrong: question.whyWrong,
      concept: question.concept,
      calculation: question.calculation,
      formula: question.formula,
      journal: question.journal,
      commonMistake: question.commonMistake,
      relatedTopics: question.relatedTopics,
      source: question.source,
      regulationYear: question.regulationYear,
      timesAnswered: question.timesAnswered,
      timesCorrect: question.timesCorrect,
      topic: question.topic,
      subtopic: question.subtopic,
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[GET /api/questions/[id]]', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memuat soal' },
      { status: 500 },
    )
  }
}
