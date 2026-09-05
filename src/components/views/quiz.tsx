'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useAppStore, type QuizQuestion, type QuizResultItem } from '@/store/app-store'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
  Calculator,
  Lightbulb,
  Brain,
  FileText,
  RotateCcw,
  Loader2,
  Zap,
  ArrowRight,
  Clock,
  Trophy,
  LayoutGrid,
  Search,
  Check,
  Sparkles,
} from 'lucide-react'

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

interface CategoryData {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  order: number
  topicCount: number
}

interface TopicData {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  categoryId: string
  questionCount: number
  category?: { id: string; name: string; slug: string }
}

export function QuizPage() {
  const {
    quizState,
    setQuizState,
    selectedTopicId,
    setSelectedTopicId,
    profile,
    setProfile,
    setProgress,
  } = useAppStore()

  // Topic Selection States
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [topics, setTopics] = useState<TopicData[]>([])
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Active Quiz States
  const [currentQuestionDetail, setCurrentQuestionDetail] = useState<QuizQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean
    correctAnswer: string
    xpEarned: number
  } | null>(null)
  
  // Timer State
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const questionStartTimeRef = useRef<number>(Date.now())

  // Load Categories and Topics if not in active quiz
  useEffect(() => {
    if (quizState) return

    setLoadingTopics(true)
    Promise.all([
      apiFetch<{ success: boolean; data: CategoryData[] }>('/api/categories'),
      apiFetch<{ success: boolean; data: TopicData[] }>('/api/topics'),
    ])
      .then(([catRes, topRes]) => {
        if (catRes.success) setCategories(catRes.data || [])
        if (topRes.success) setTopics(topRes.data || [])
      })
      .catch(() => {
        toast.error('Gagal memuat kategori & topik kuis')
      })
      .finally(() => {
        setLoadingTopics(false)
      })
  }, [quizState])

  // Timer effect during active quiz
  useEffect(() => {
    if (quizState && !quizState.isSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeSpentSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [quizState])

  // Start Quiz for a Topic
  const startQuizForTopic = async (topic: TopicData) => {
    setSelectedTopicId(topic.id)
    setLoadingTopics(true)

    try {
      const res = await apiFetch<{ success: boolean; data: QuizQuestion[] }>(
        `/api/questions?topicId=${topic.id}&random=true&limit=15`,
      )

      if (!res.success || !res.data || res.data.length === 0) {
        toast.error('Belum ada soal pada topik ini. Silakan pilih topik lain.')
        setLoadingTopics(false)
        return
      }

      setQuizState({
        topicId: topic.id,
        topicName: topic.name,
        categoryName: topic.category?.name,
        questions: res.data.map((q) => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : [],
        })),
        currentIndex: 0,
        answers: {},
        results: [],
        isSubmitted: false,
      })

      setCurrentQuestionDetail(res.data[0])
      setSelectedAnswer(null)
      setIsAnswered(false)
      setLastResult(null)
      setTimeSpentSeconds(0)
      questionStartTimeRef.current = Date.now()
      toast.success(`Kuis ${topic.name} dimulai! Selamat mengerjakan.`)
    } catch {
      toast.error('Gagal memulai kuis')
    } finally {
      setLoadingTopics(false)
    }
  }

  // Handle Answer Selection
  const handleSelectOption = (option: string) => {
    if (isAnswered) return
    setSelectedAnswer(option)
  }

  // Submit Single Question Answer
  const handleSubmitAnswer = async () => {
    if (!quizState || !selectedAnswer || submitting || isAnswered) return

    const currentQ = quizState.questions[quizState.currentIndex]
    if (!currentQ) return

    setSubmitting(true)
    const timeMs = Date.now() - questionStartTimeRef.current

    try {
      const res = await apiFetch<{
        success: boolean
        data: {
          isCorrect: boolean
          correctAnswer: string
          question: QuizQuestion
          xpEarned: number
        }
      }>('/api/quiz/answer', {
        method: 'POST',
        body: JSON.stringify({
          questionId: currentQ.id,
          userAnswer: selectedAnswer,
          timeMs,
        }),
      })

      if (res.success) {
        const { isCorrect, correctAnswer, question: updatedQ, xpEarned } = res.data
        setIsAnswered(true)
        setLastResult({ isCorrect, correctAnswer, xpEarned })
        setCurrentQuestionDetail(updatedQ)

        // Update local quizState answers and results
        const newAnswers = { ...quizState.answers, [currentQ.id]: selectedAnswer }
        const newResults: QuizResultItem[] = [
          ...quizState.results,
          {
            questionId: currentQ.id,
            isCorrect,
            userAnswer: selectedAnswer,
            correctAnswer,
            question: updatedQ,
            xpEarned,
          },
        ]

        setQuizState({
          ...quizState,
          answers: newAnswers,
          results: newResults,
        })

        // Update Profile XP
        if (xpEarned > 0 && profile) {
          setProfile({
            ...profile,
            xp: profile.xp + xpEarned,
          })
        }
      }
    } catch {
      toast.error('Gagal mengirim jawaban')
    } finally {
      setSubmitting(false)
    }
  }

  // Move to Next Question or Submit Quiz
  const handleNextQuestion = () => {
    if (!quizState) return

    const nextIndex = quizState.currentIndex + 1
    if (nextIndex < quizState.questions.length) {
      setQuizState({
        ...quizState,
        currentIndex: nextIndex,
      })
      setCurrentQuestionDetail(quizState.questions[nextIndex])
      setSelectedAnswer(null)
      setIsAnswered(false)
      setLastResult(null)
      questionStartTimeRef.current = Date.now()
    } else {
      // Quiz Finished!
      setQuizState({
        ...quizState,
        isSubmitted: true,
      })
      toast.success('Kuis selesai! Lihat hasil skor Anda.')
    }
  }

  // Retake current topic
  const handleRetakeQuiz = () => {
    if (!quizState) return
    const topic = topics.find((t) => t.id === quizState.topicId)
    if (topic) {
      startQuizForTopic(topic)
    } else {
      setQuizState(null)
      setSelectedTopicId(null)
    }
  }

  // Filter topics for topic selector
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchCategory =
        selectedCategoryTab === 'all' || t.categoryId === selectedCategoryTab
      const matchSearch =
        searchQuery.trim() === '' ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchCategory && matchSearch
    })
  }, [topics, selectedCategoryTab, searchQuery])

  // Format Timer String
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`
  }

  // ==========================================
  // VIEW 1: TOPIC & CATEGORY SELECTION
  // ==========================================
  if (!quizState) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Latihan Ujian Sertifikasi Brevet Pajak
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Pilih Modul & Topik Kuis
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Latih pemahaman perpajakan Indonesia Anda mulai dari PPh Orang Pribadi, PPh Badan, PotPut, PPN & PPnBM hingga KUP dengan pembahasan lengkap.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            <Button
              variant={selectedCategoryTab === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategoryTab('all')}
              className={`rounded-full text-xs font-medium ${
                selectedCategoryTab === 'all'
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  : 'bg-white hover:bg-slate-100 text-slate-700'
              }`}
            >
              Semua Topik ({topics.length})
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategoryTab === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategoryTab(cat.id)}
                className={`rounded-full text-xs font-medium whitespace-nowrap ${
                  selectedCategoryTab === cat.id
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari topik perpajakan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-white"
            />
          </div>
        </div>

        {/* Topics Grid */}
        {loadingTopics ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Memuat topik kuis Brevet...</p>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">Tidak ada topik yang sesuai</h3>
            <p className="text-xs text-slate-500 mt-1">Coba kata kunci pencarian lain atau pilih kategori Semua.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredTopics.map((topic) => (
              <Card
                key={topic.id}
                className="group border border-slate-200/80 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200 bg-white flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold tracking-wide text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                      {topic.category?.name || 'Brevet Pajak'}
                    </span>
                    <Badge variant="secondary" className="text-[11px] font-normal text-slate-600 bg-slate-100">
                      {topic.questionCount || 0} Soal
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors pt-1.5">
                    {topic.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {topic.description || 'Latihan soal dan pemahaman konsep perpajakan sesuai peraturan terbaru.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <Button
                    onClick={() => startQuizForTopic(topic)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-9 shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1.5 group-hover:translate-y-[-1px] transition-transform"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Mulai Kuis Soal
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ==========================================
  // VIEW 2: QUIZ COMPLETED / RESULT SCREEN
  // ==========================================
  if (quizState.isSubmitted) {
    const totalQuestions = quizState.results.length || quizState.questions.length
    const correctCount = quizState.results.filter((r) => r.isCorrect).length
    const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
    const totalXPEarned = quizState.results.reduce((acc, r) => acc + (r.xpEarned || 0), 0)

    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Score Summary Card */}
        <Card className="border-0 shadow-xl shadow-slate-200/60 bg-white text-center overflow-hidden mb-6">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-8">
            <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur mb-4 shadow-inner">
              <Trophy className="h-10 w-10 text-amber-300" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Kuis Selesai!</h2>
            <p className="text-emerald-100 text-sm mt-1">
              Topik: {quizState.topicName}
            </p>

            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 border border-white/20">
                <span className="text-xs uppercase tracking-wider text-emerald-100 font-semibold">Skor Akhir</span>
                <p className="text-3xl font-black">{scorePercent}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 border border-white/20">
                <span className="text-xs uppercase tracking-wider text-emerald-100 font-semibold">Benar / Total</span>
                <p className="text-3xl font-black">
                  {correctCount} / {totalQuestions}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 border border-white/20">
                <span className="text-xs uppercase tracking-wider text-emerald-100 font-semibold">XP Didapat</span>
                <p className="text-3xl font-black text-amber-300">+{totalXPEarned}</p>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleRetakeQuiz}
                variant="outline"
                className="font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 h-11 flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Ulangi Kuis Topik Ini
              </Button>
              <Button
                onClick={() => {
                  setQuizState(null)
                  setSelectedTopicId(null)
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 flex items-center justify-center gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Pilih Topik Lain
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Question Review List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            Pembahasan Lengkap Semua Soal
          </h3>

          {quizState.results.map((res, idx) => (
            <Card
              key={res.questionId || idx}
              className={`border transition-all bg-white ${
                res.isCorrect ? 'border-emerald-200' : 'border-red-200'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant={res.isCorrect ? 'default' : 'destructive'}
                    className={`text-xs px-2.5 py-0.5 flex items-center gap-1 ${
                      res.isCorrect ? 'bg-emerald-600' : 'bg-red-600'
                    }`}
                  >
                    {res.isCorrect ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Benar (+{res.xpEarned} XP)
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" /> Kurang Tepat
                      </>
                    )}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-400">Soal #{idx + 1}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 mt-2">{res.question.question}</p>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 text-xs sm:text-sm">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <p className="text-slate-700">
                    <strong className="text-slate-900">Jawaban Anda:</strong>{' '}
                    <span className={res.isCorrect ? 'text-emerald-700 font-semibold' : 'text-red-700 font-semibold'}>
                      {res.userAnswer}
                    </span>
                  </p>
                  {!res.isCorrect && (
                    <p className="text-slate-700">
                      <strong className="text-slate-900">Kunci Jawaban Benar:</strong>{' '}
                      <span className="text-emerald-700 font-semibold">{res.correctAnswer}</span>
                    </p>
                  )}
                </div>

                {/* Explanations */}
                {(res.question.shortExplanation || res.question.fullExplanation) && (
                  <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 space-y-2">
                    <p className="font-semibold flex items-center gap-1.5 text-emerald-900">
                      <Lightbulb className="h-4 w-4 text-emerald-600" />
                      Pembahasan & Analisis:
                    </p>
                    <p className="leading-relaxed whitespace-pre-line text-xs sm:text-sm text-slate-800">
                      {res.question.fullExplanation || res.question.shortExplanation}
                    </p>

                    {res.question.formula && (
                      <div className="mt-2 pt-2 border-t border-emerald-200/60">
                        <p className="font-semibold text-emerald-900 text-xs flex items-center gap-1">
                          <Calculator className="h-3.5 w-3.5" /> Rumus / Formula Pajak:
                        </p>
                        <code className="block bg-white p-2 rounded border border-emerald-200 text-xs font-mono text-slate-800 mt-1">
                          {res.question.formula}
                        </code>
                      </div>
                    )}

                    {res.question.calculation && (
                      <div className="mt-2 pt-2 border-t border-emerald-200/60">
                        <p className="font-semibold text-emerald-900 text-xs flex items-center gap-1">
                          <Calculator className="h-3.5 w-3.5" /> Langkah Perhitungan:
                        </p>
                        <p className="text-xs text-slate-800 mt-1 whitespace-pre-line bg-white p-2 rounded border border-emerald-200">
                          {res.question.calculation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // ==========================================
  // VIEW 3: ACTIVE QUIZ QUESTION SOLVER
  // ==========================================
  const currentQ = quizState.questions[quizState.currentIndex]
  const currentQNumber = quizState.currentIndex + 1
  const totalQCount = quizState.questions.length
  const progressPercent = (currentQNumber / totalQCount) * 100

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Quiz Header Bar */}
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded">
              {quizState.topicName}
            </span>
            <Badge variant="outline" className="text-xs text-slate-600">
              Tingkat {currentQ?.difficulty || 1}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Soal {currentQNumber} dari {totalQCount}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            {formatTime(timeSpentSeconds)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progressPercent} className="h-2 mb-6 bg-slate-200" />

      {/* Main Question Card */}
      <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white mb-6">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Pertanyaan #{currentQNumber}</span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2 leading-relaxed">
              {currentQ?.question}
            </h2>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3">
            {currentQ?.options.map((option, idx) => {
              const label = OPTION_LABELS[idx] || `${idx + 1}`
              const isSelected = selectedAnswer === option
              const isCorrectAnswer =
                isAnswered && lastResult && option.trim().toLowerCase() === lastResult.correctAnswer.trim().toLowerCase()
              const isWrongSelected =
                isAnswered && lastResult && isSelected && !lastResult.isCorrect

              let optionStyle =
                'border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/30 text-slate-800'

              if (isSelected && !isAnswered) {
                optionStyle = 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20 text-emerald-950 font-semibold'
              } else if (isCorrectAnswer) {
                optionStyle = 'border-emerald-600 bg-emerald-100/70 text-emerald-950 font-bold ring-2 ring-emerald-600/30'
              } else if (isWrongSelected) {
                optionStyle = 'border-red-500 bg-red-100/70 text-red-950 font-bold ring-2 ring-red-500/30'
              } else if (isAnswered) {
                optionStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60'
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group ${optionStyle}`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      isSelected && !isAnswered
                        ? 'bg-emerald-600 text-white'
                        : isCorrectAnswer
                        ? 'bg-emerald-600 text-white'
                        : isWrongSelected
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                    }`}
                  >
                    {isCorrectAnswer ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : isWrongSelected ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      label
                    )}
                  </div>
                  <span className="text-sm sm:text-base leading-relaxed pt-0.5">{option}</span>
                </button>
              )
            })}
          </div>

          {/* Action Button: Submit Answer */}
          {!isAnswered ? (
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer || submitting}
                className="w-full sm:w-auto px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 shadow-md shadow-emerald-600/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memeriksa...
                  </>
                ) : (
                  <>
                    Kirim Jawaban
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* Post-Answer Feedback & Next Button */
            <div className="mt-8 space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  lastResult?.isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {lastResult?.isCorrect ? (
                    <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-red-600 text-white flex items-center justify-center">
                      <XCircle className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-sm sm:text-base">
                      {lastResult?.isCorrect ? 'Jawaban Benar!' : 'Jawaban Kurang Tepat'}
                    </h4>
                    <p className="text-xs opacity-90">
                      {lastResult?.isCorrect
                        ? `Selamat, Anda mendapatkan +${lastResult.xpEarned} XP!`
                        : `Kunci jawaban yang tepat adalah: ${lastResult?.correctAnswer}`}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleNextQuestion}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm h-10 px-5 shadow-sm"
                >
                  {currentQNumber < totalQCount ? 'Soal Berikutnya ➔' : 'Lihat Hasil Kuis'}
                </Button>
              </div>

              {/* Comprehensive Explanation & Calculations Box */}
              {(currentQuestionDetail?.shortExplanation ||
                currentQuestionDetail?.fullExplanation ||
                currentQuestionDetail?.whyCorrect ||
                currentQuestionDetail?.calculation ||
                currentQuestionDetail?.formula) && (
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <Lightbulb className="h-4 w-4 text-emerald-600" />
                    <span>Pembahasan & Teori Pajak:</span>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                    {currentQuestionDetail.fullExplanation || currentQuestionDetail.shortExplanation}
                  </p>

                  {currentQuestionDetail.whyCorrect && (
                    <div className="bg-emerald-50/80 p-3 rounded-lg border border-emerald-100 text-xs">
                      <strong className="text-emerald-900 block mb-1">💡 Kenapa Jawaban Ini Benar:</strong>
                      <span className="text-emerald-950">{currentQuestionDetail.whyCorrect}</span>
                    </div>
                  )}

                  {currentQuestionDetail.formula && (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                      <strong className="text-slate-900 flex items-center gap-1 mb-1">
                        <Calculator className="h-3.5 w-3.5 text-emerald-600" /> Rumus / Formula:
                      </strong>
                      <code className="font-mono text-emerald-800 font-semibold">{currentQuestionDetail.formula}</code>
                    </div>
                  )}

                  {currentQuestionDetail.calculation && (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                      <strong className="text-slate-900 flex items-center gap-1 mb-1">
                        <Calculator className="h-3.5 w-3.5 text-emerald-600" /> Langkah Perhitungan:
                      </strong>
                      <p className="text-slate-700 whitespace-pre-line">{currentQuestionDetail.calculation}</p>
                    </div>
                  )}

                  {currentQuestionDetail.commonMistake && (
                    <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-200 text-xs">
                      <strong className="text-amber-900 flex items-center gap-1 mb-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Jebakan / Kesalahan Umum:
                      </strong>
                      <span className="text-amber-950">{currentQuestionDetail.commonMistake}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
