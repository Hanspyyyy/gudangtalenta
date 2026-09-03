import { Warehouse } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BrandLogo({
  className,
  size = 'md',
  showText = true,
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}) {
  const box =
    size === 'lg' ? 'size-12' : size === 'sm' ? 'size-8' : 'size-10'
  const icon = size === 'lg' ? 'size-6' : size === 'sm' ? 'size-4' : 'size-5'
  const title =
    size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-sm' : 'text-base'

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'grid place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm',
          box,
        )}
      >
        <Warehouse className={icon} aria-hidden="true" />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-semibold tracking-tight', title)}>
            Gudang Talenta
          </span>
          <span className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Inventory System
          </span>
        </div>
      )}
    </div>
  )
}
