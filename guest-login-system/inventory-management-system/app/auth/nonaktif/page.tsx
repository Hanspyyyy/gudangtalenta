import { Ban } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { LogoutButton } from '@/components/logout-button'

export default function NonaktifPage() {
  return (
    <main className="flex min-h-svh w-full flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <BrandLogo size="lg" showText={false} />
        </div>
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
          <Ban className="size-7" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Akun Dinonaktifkan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Akun Anda saat ini tidak aktif. Hubungi administrator gudang untuk
          mengaktifkan kembali akses Anda.
        </p>
        <div className="mt-6">
          <LogoutButton className="h-11 w-full" />
        </div>
      </div>
    </main>
  )
}
