import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  description,
  backHref,
  action,
  className,
}: {
  title: string
  description?: string
  backHref?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md',
        className,
      )}
    >
      <div className="flex min-h-14 items-center gap-2 px-4 py-3">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Kembali"
            className="-ml-2 grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="truncate text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  )
}
