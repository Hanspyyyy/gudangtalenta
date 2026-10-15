import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProductImage({
  src,
  alt,
  className,
  iconClassName,
}: {
  src?: string | null
  alt: string
  className?: string
  iconClassName?: string
}) {
  const imageSrc = src?.startsWith('/inventory-photos/')
    ? `https://cdn.jsdelivr.net/gh/Hanspyyyy/gudangtalenta@main/guest-login-system/inventory-management-system/public${src}`
    : src

  if (imageSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt={alt}
        className={cn('object-cover', className)}
        loading="lazy"
      />
    )
  }
  return (
    <div
      className={cn(
        'grid place-items-center bg-secondary text-muted-foreground',
        className,
      )}
      aria-hidden="true"
    >
      <Package className={cn('size-6', iconClassName)} />
    </div>
  )
}
