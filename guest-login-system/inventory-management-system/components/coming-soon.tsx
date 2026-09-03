import type { LucideIcon } from 'lucide-react'

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <Icon className="size-7" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-xs text-sm text-muted-foreground text-pretty">
        {description}
      </p>
      <span className="mt-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        Segera hadir
      </span>
    </div>
  )
}
