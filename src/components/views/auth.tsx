'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Zap } from 'lucide-react'

interface AuthResponse {
  success?: boolean
  token: string
  user: unknown
  profile?: unknown
  progress?: unknown
}

export function LoginPage() {
  const { navigate, setToken, setUser, setProfile, setProgress } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Email dan password wajib diisi')
      return
    }
    setLoading(true)
    try {
      const res = await apiFetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (res && res.token) {
        setToken(res.token)
        setUser(res.user as Parameters<typeof setUser>[0])
        setProfile(res.profile as Parameters<typeof setProfile>[0])
        setProgress(res.progress as Parameters<typeof setProgress>[0])
        navigate('quiz')
        toast.success('Selamat datang! Siap latihan soal Brevet.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login gagal. Periksa email & password.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      const demoEmail = 'peserta@brevet.tax'
      const demoPassword = 'password123'
      
      let res: AuthResponse
      try {
        res = await apiFetch<AuthResponse>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: demoEmail, password: demoPassword }),
        })
      } catch {
        // If demo user doesn't exist, register it
        res = await apiFetch<AuthResponse>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name: 'Peserta Brevet', email: demoEmail, password: demoPassword }),
        })
      }

      if (res && res.token) {
        setToken(res.token)
        setUser(res.user as Parameters<typeof setUser>[0])
        setProfile(res.profile as Parameters<typeof setProfile>[0])
        setProgress(res.progress as Parameters<typeof setProgress>[0])
        navigate('quiz')
        toast.success('Masuk sebagai Peserta Brevet!')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal masuk akun demo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md border-0 shadow-xl shadow-slate-200/50 bg-white">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-xl font-bold shadow-lg shadow-emerald-600/30">
            TP
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">Masuk ke TaxPresto</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Platform Latihan Soal Ujian Brevet Pajak A & B
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-semibold text-gray-700">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-10"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-10 font-semibold shadow-md shadow-emerald-600/20 text-white"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Masuk
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-medium">atau langsung mulai</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-800 font-medium h-10 flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4 text-emerald-600" />
            Mulai Cepat (Akun Tamu / Demo)
          </Button>

          <p className="pt-2 text-center text-sm text-gray-600">
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={() => navigate('register')}
              className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Daftar Akun Baru
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function RegisterPage() {
  const { navigate, setToken, setUser, setProfile, setProgress } = useAppStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      toast.error('Semua field wajib diisi')
      return
    }
    if (password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok')
      return
    }
    setLoading(true)
    try {
      const res = await apiFetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      })
      if (res && res.token) {
        setToken(res.token)
        setUser(res.user as Parameters<typeof setUser>[0])
        setProfile(res.profile as Parameters<typeof setProfile>[0])
        setProgress(res.progress as Parameters<typeof setProgress>[0])
        navigate('quiz')
        toast.success('Pendaftaran berhasil! Selamat datang di TaxPresto Brevet.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Pendaftaran gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md border-0 shadow-xl shadow-slate-200/50 bg-white">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-xl font-bold shadow-lg shadow-emerald-600/30">
            TP
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">Buat Akun Baru</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Daftar untuk menyimpan riwayat & skor latihan Brevet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-gray-700">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-xs font-semibold text-gray-700">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="anda@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-password" className="text-xs font-semibold text-gray-700">Password</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs font-semibold text-gray-700">Konfirmasi Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="h-10"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-10 font-semibold shadow-md shadow-emerald-600/20 text-white mt-2"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Daftar Sekarang
            </Button>
          </form>

          <p className="pt-2 text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={() => navigate('login')}
              className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Masuk
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
