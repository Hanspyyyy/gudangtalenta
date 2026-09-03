'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ClipboardList, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: Home,
    match: (p: string) => p === '/' || p === '/dashboard',
  },
  {
    href: '/cari',
    label: 'Cari',
    icon: Search,
    match: (p: string) => p.startsWith('/cari'),
  },
  {
    href: '/aktivitas',
    label: 'Aktivitas',
    icon: ClipboardList,
    match: (p: string) => p.startsWith('/aktivitas'),
  },
  {
    href: '/profil',
    label: 'Profil',
    icon: User,
    match: (p: string) => p.startsWith('/profil') || p.startsWith('/admin'),
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md pb-safe"
    >
      <ul className="mx-auto flex h-16 max-w-2xl items-stretch">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon
                  className={cn('size-5', active && 'stroke-[2.5]')}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
