import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'primary',
  href,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: 'primary' | 'success' | 'warning' | 'neutral'
  href?: string
}) {
  const toneClass = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/20 text-warning-foreground',
    neutral: 'bg-secondary text-secondary-foreground',
  }[tone]

  const content = (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className={cn('grid size-9 place-items-center rounded-lg', toneClass)}>
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
      </div>
      <div>
        <div className="font-mono text-2xl font-semibold leading-none tracking-tight">
          {value}
        </div>
        <div className="mt-1.5 text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  )

  return content
}
