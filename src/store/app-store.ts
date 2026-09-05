import { create } from 'zustand'

export type PageName = 'login' | 'register' | 'quiz'

export interface UserProfileData {
  id: string
  userId: string
  xp: number
  level: number
  streak: number
  longestStreak: number
}

export interface UserProgressData {
  id: string
  userId: string
  totalQuestions: number
  totalCorrect: number
  totalWrong: number
  accuracy: number
  totalXP: number
}

export interface UserData {
  id: string
  email: string
  name: string | null
  role: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  difficulty: number
  alreadyCorrect: boolean
  shortExplanation?: string | null
  fullExplanation?: string | null
  whyCorrect?: string | null
  whyWrong?: string | null
  concept?: string | null
  calculation?: string | null
  formula?: string | null
  journal?: string | null
  commonMistake?: string | null
}

export interface QuizResultItem {
  questionId: string
  isCorrect: boolean
  userAnswer: string
  correctAnswer: string
  question: QuizQuestion
  xpEarned: number
}

export interface QuizState {
  topicId: string
  topicName: string
  categoryName?: string
  questions: QuizQuestion[]
  currentIndex: number
  answers: Record<string, string>
  results: QuizResultItem[]
  isSubmitted: boolean
}

interface AppState {
  // Routing
  currentPage: PageName

  // Selections
  selectedTopicId: string | null
  selectedCategoryId: string | null

  // Quiz state
  quizState: QuizState | null

  // Auth
  user: UserData | null
  profile: UserProfileData | null
  progress: UserProgressData | null
  token: string | null
  isLoading: boolean

  // Actions
  navigate: (page: PageName) => void
  setSelectedTopicId: (id: string | null) => void
  setSelectedCategoryId: (id: string | null) => void
  setQuizState: (state: QuizState | null) => void
  setToken: (token: string | null) => void
  setUser: (user: UserData | null) => void
  setProfile: (profile: UserProfileData | null) => void
  setProgress: (progress: UserProgressData | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  initializeAuth: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  currentPage: 'login',
  selectedTopicId: null,
  selectedCategoryId: null,
  quizState: null,
  user: null,
  profile: null,
  progress: null,
  token: null,
  isLoading: true,

  navigate: (page) => {
    set({ currentPage: page })
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  },

  setSelectedTopicId: (id) => set({ selectedTopicId: id }),
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setQuizState: (state) => set({ quizState: state }),

  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('brevet_token', token)
      } else {
        localStorage.removeItem('brevet_token')
      }
    }
    set({ token })
  },

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setProgress: (progress) => set({ progress }),
  setLoading: (loading) => set({ isLoading: loading }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('brevet_token')
    }
    set({
      token: null,
      user: null,
      profile: null,
      progress: null,
      currentPage: 'login',
      quizState: null,
      selectedTopicId: null,
      selectedCategoryId: null,
    })
  },

  initializeAuth: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false })
      return
    }

    const savedToken = localStorage.getItem('brevet_token')
    if (!savedToken) {
      set({ isLoading: false, currentPage: 'login' })
      return
    }

    set({ token: savedToken })

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        set({
          user: data.user,
          profile: data.profile,
          progress: data.progress,
          currentPage: 'quiz',
        })
      } else {
        localStorage.removeItem('brevet_token')
        set({ token: null, currentPage: 'login' })
      }
    } catch {
      localStorage.removeItem('brevet_token')
      set({ token: null, currentPage: 'login' })
    } finally {
      set({ isLoading: false })
    }
  },
}))
