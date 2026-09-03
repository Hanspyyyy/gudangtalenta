import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/brand-logo'

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-svh w-full flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <BrandLogo size="lg" showText={false} />
        </div>
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-destructive/15 text-destructive">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Terjadi Kesalahan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Tautan otentikasi tidak valid atau sudah kedaluwarsa. Silakan coba
          masuk kembali.
        </p>
        <Button asChild className="mt-6 h-11 w-full">
          <Link href="/auth/login">Kembali ke Halaman Masuk</Link>
        </Button>
      </div>
    </main>
  )
}
