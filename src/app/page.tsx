'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Navbar } from '@/components/layout/navbar'
import { LoginPage, RegisterPage } from '@/components/views/auth'
import { QuizPage } from '@/components/views/quiz'
import { Toaster } from '@/components/ui/sonner'

export default function Home() {
  const { currentPage, isLoading, initializeAuth, user } = useAppStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-xl font-bold animate-pulse shadow-lg shadow-emerald-600/30">
            TP
          </div>
          <p className="text-sm font-medium text-slate-600">Memuat TaxPresto Brevet...</p>
        </div>
      </div>
    )
  }

  // Routing
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {user && currentPage === 'quiz' && <Navbar />}
      
      <main className="flex-1 flex flex-col">
        {currentPage === 'login' && <LoginPage />}
        {currentPage === 'register' && <RegisterPage />}
        {currentPage === 'quiz' && <QuizPage />}
      </main>

      <Toaster richColors position="top-center" />
    </div>
  )
}
