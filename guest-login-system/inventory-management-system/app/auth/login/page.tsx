'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BrandLogo } from '@/components/brand-logo'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!response.ok) {
        setError('Email atau kata sandi salah.')
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-svh w-full flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-6 text-center">
          <BrandLogo size="lg" showText={false} />
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              Gudang Talenta 
            </h1>
            <p className="text-sm text-muted-foreground text-pretty">
              Untuk melihat stok barang atau mengajukan permintaan barang proyek, silakan gunakan tombol 'Masuk sebagai Guest', iman ucapkan terimakasih.
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="nama@perusahaan.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="h-11 w-full text-base"
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          className="mt-3 h-11 w-full text-base"
          onClick={async () => {
            setIsLoading(true)
            setError(null)
            try {
              const response = await fetch('/api/auth/guest', { method: 'POST' })
              if (!response.ok) {
                throw new Error('Guest session bootstrap failed')
              }
              router.push('/dashboard')
              router.refresh()
            } catch {
              setError('Mode Guest tidak dapat dimulai. Silakan coba lagi.')
            } finally {
              setIsLoading(false)
            }
          }}
          disabled={isLoading}
        >
          Masuk sebagai Guest
        </Button>
      </div>
    </main>
  )
}
