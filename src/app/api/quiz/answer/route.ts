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

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Anda harus login terlebih dahulu' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { questionId, userAnswer, timeMs, simulationId } = body

    if (!questionId || userAnswer === undefined) {
      return NextResponse.json(
        { success: false, error: 'questionId dan userAnswer wajib diisi' },
        { status: 400 },
      )
    }

    const question = await db.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Soal tidak ditemukan' },
        { status: 404 },
      )
    }

    const isCorrect = String(userAnswer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase()
    const xpEarned = isCorrect ? question.difficulty * 10 : 0

    // Save Attempt
    await db.attempt.create({
      data: {
        userId: session.userId,
        questionId,
        userAnswer: String(userAnswer),
        isCorrect,
        timeMs: timeMs || 0,
        xpEarned,
        simulationId: simulationId || null,
      },
    })

    // Update question stats
    await db.question.update({
      where: { id: questionId },
      data: {
        timesAnswered: { increment: 1 },
        timesCorrect: isCorrect ? { increment: 1 } : undefined,
      },
    })

    // Upsert TopicProgress
    const existingProgress = await db.topicProgress.findUnique({
      where: { userId_topicId: { userId: session.userId, topicId: question.topicId } },
    })

    if (existingProgress) {
      const newAttempted = existingProgress.questionsAttempted + 1
      const newCorrect = existingProgress.correctCount + (isCorrect ? 1 : 0)
      const newWrong = existingProgress.wrongCount + (isCorrect ? 0 : 1)
      await db.topicProgress.update({
        where: { id: existingProgress.id },
        data: {
          questionsAttempted: newAttempted,
          correctCount: newCorrect,
          wrongCount: newWrong,
          accuracy: newAttempted > 0 ? (newCorrect / newAttempted) * 100 : 0,
          lastAttemptAt: new Date(),
        },
      })
    } else {
      await db.topicProgress.create({
        data: {
          userId: session.userId,
          topicId: question.topicId,
          questionsAttempted: 1,
          correctCount: isCorrect ? 1 : 0,
          wrongCount: isCorrect ? 0 : 1,
          accuracy: isCorrect ? 100 : 0,
          lastAttemptAt: new Date(),
        },
      })
    }

    // Update UserProgress
    const userProgress = await db.userProgress.findUnique({
      where: { userId: session.userId },
    })

    if (userProgress) {
      const newTotal = userProgress.totalQuestions + 1
      const newCorrect = userProgress.totalCorrect + (isCorrect ? 1 : 0)
      const newWrong = userProgress.totalWrong + (isCorrect ? 0 : 1)
      await db.userProgress.update({
        where: { userId: session.userId },
        data: {
          totalQuestions: newTotal,
          totalCorrect: newCorrect,
          totalWrong: newWrong,
          accuracy: newTotal > 0 ? (newCorrect / newTotal) * 100 : 0,
          totalXP: { increment: xpEarned },
          totalTimeMs: { increment: timeMs || 0 },
          topicsStudied: newTotal === 1 ? { increment: 1 } : undefined,
        },
      })
    }

    // Update UserProfile XP
    if (xpEarned > 0) {
      const profile = await db.userProfile.findUnique({
        where: { userId: session.userId },
      })
      if (profile) {
        const newXP = profile.xp + xpEarned
        const newLevel = Math.floor(newXP / 100) + 1
        await db.userProfile.update({
          where: { userId: session.userId },
          data: { xp: newXP, level: newLevel, lastActiveAt: new Date() },
        })
      }
    } else {
      await db.userProfile.update({
        where: { userId: session.userId },
        data: { lastActiveAt: new Date() },
      }).catch(() => {})
    }

    let remedialId: string | null = null

    // If wrong, create Mistake and Remedial
    if (!isCorrect) {
      await db.mistake.create({
        data: {
          userId: session.userId,
          questionId,
          userAnswer: String(userAnswer),
          correctAnswer: question.correctAnswer,
          topicId: question.topicId,
          subtopicId: question.subtopicId,
          categoryId: question.categoryId,
          difficulty: question.difficulty,
          timeMs: timeMs || 0,
        },
      })

      // Generate remedial question (MVP: copy question with REMEDIAL prefix, shuffle wrong options)
      let options = parseOptions(question.options) as string[]
      const wrongOptions = options.filter(
        (o: string) => o.toLowerCase() !== question.correctAnswer.toLowerCase(),
      )
      const shuffledWrong = fisherYatesShuffle(wrongOptions)

      // Keep correct answer and add 3 wrong options (or fewer if not available)
      const remedialOptions = [question.correctAnswer, ...shuffledWrong.slice(0, 3)]
      const finalOptions = fisherYatesShuffle(remedialOptions)

      const remedial = await db.remedial.create({
        data: {
          userId: session.userId,
          originalQuestionId: questionId,
          topicId: question.topicId,
          subtopicId: question.subtopicId,
          questionText: `REMEDIAL: ${question.question}`,
          options: JSON.stringify(finalOptions),
          correctAnswer: question.correctAnswer,
          explanation: question.shortExplanation || question.fullExplanation,
          difficulty: question.difficulty,
        },
      })
      remedialId = remedial.id
    }

    let optionsParsed: unknown[] = []
    try {
      optionsParsed = JSON.parse(question.options)
    } catch {
      optionsParsed = []
    }

    const questionData = {
      id: question.id,
      question: question.question,
      options: optionsParsed,
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
    }

    return NextResponse.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        question: questionData,
        xpEarned,
        remedialId,
      },
    })
  } catch (error) {
    console.error('[POST /api/quiz/answer]', error)
    return NextResponse.json(
      { success: false, error: 'Gagal memproses jawaban' },
      { status: 500 },
    )
  }
}
