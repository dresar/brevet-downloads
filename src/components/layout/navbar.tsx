'use client'

import { useAppStore } from '@/store/app-store'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BookOpen, LogOut, Zap, LayoutGrid } from 'lucide-react'

export function Navbar() {
  const { user, profile, quizState, setQuizState, setSelectedTopicId, logout } = useAppStore()

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    logout()
  }

  const handleResetToTopics = () => {
    setQuizState(null)
    setSelectedTopicId(null)
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetToTopics}
            className="flex items-center gap-2.5 text-left group transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-lg shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              TP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-900 tracking-tight text-base">TaxPresto</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                  BREVET
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">Platform Latihan Ujian Brevet Pajak A & B</p>
            </div>
          </button>
        </div>

        {/* Center / Quiz context if active */}
        {quizState && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-800">
            <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
            <span className="truncate max-w-[200px]">{quizState.topicName || 'Latihan Soal'}</span>
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {quizState && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToTopics}
              className="text-xs h-9 font-medium border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
              Pilih Topik
            </Button>
          )}

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-semibold text-gray-800 leading-tight">
                  {user.name || user.email.split('@')[0]}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                  <Zap className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <span>{profile?.xp || 0} XP</span>
                </div>
              </div>

              <Avatar className="h-8 w-8 border border-emerald-200 bg-emerald-100 text-emerald-800 text-xs font-bold">
                <AvatarFallback className="bg-emerald-100 text-emerald-800">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Keluar"
                className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
