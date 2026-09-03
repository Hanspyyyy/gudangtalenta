'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut } from 'lucide-react'

export function LogoutButton({
  className,
  variant = 'outline',
}: {
  className?: string
  variant?: 'outline' | 'destructive' | 'ghost' | 'default'
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleLogout}
      disabled={loading}
    >
      <LogOut className="size-4" aria-hidden="true" />
      {loading ? 'Keluar...' : 'Keluar'}
    </Button>
  )
}
