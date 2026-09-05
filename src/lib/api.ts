import { useAppStore } from '@/store/app-store'

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAppStore.getState().token

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(path, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/api/auth/login')) {
      useAppStore.getState().logout()
      const msg = data.error || data.message || 'Sesi telah berakhir, silakan login kembali'
      throw new ApiError(msg, 401)
    }
    const msg = data.error || data.message || 'Terjadi kesalahan'
    throw new ApiError(msg, res.status)
  }

  return data as T
}

export { ApiError }
