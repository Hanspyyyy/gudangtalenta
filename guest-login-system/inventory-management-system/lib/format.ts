const TZ = 'Asia/Jakarta'

const dateTimeFmt = new Intl.DateTimeFormat('id-ID', {
  timeZone: TZ,
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const dateFmt = new Intl.DateTimeFormat('id-ID', {
  timeZone: TZ,
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const timeFmt = new Intl.DateTimeFormat('id-ID', {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
})

/** e.g. "01 September 2026, 10:45" */
export function formatDateTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return dateTimeFmt.format(d).replace(' pukul ', ', ')
}

/** e.g. "01 September 2026" */
export function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return dateFmt.format(d)
}

/** e.g. "10:45" */
export function formatTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return timeFmt.format(d)
}

/** Relative time in Indonesian: "5 menit lalu", "2 hari lalu" */
export function formatRelative(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  const diffMs = Date.now() - d.getTime()
  const sec = Math.round(diffMs / 1000)
  if (sec < 60) return 'baru saja'
  const min = Math.round(sec / 60)
  if (min < 60) return `${min} menit lalu`
  const hour = Math.round(min / 60)
  if (hour < 24) return `${hour} jam lalu`
  const day = Math.round(hour / 24)
  if (day < 30) return `${day} hari lalu`
  return formatDate(d)
}

/** Format a stock quantity, trimming trailing zeros: 120, 1.5 */
export function formatQty(value: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(
    value,
  )
}

/** "120 pcs" — quantity with unit abbreviation/name */
export function formatQtyUnit(value: number, unit?: string | null): string {
  const q = formatQty(value)
  return unit ? `${q} ${unit}` : q
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

/** Whether a transaction timestamp is within the last 7 days. */
export function isRecent(value: string | Date): boolean {
  const d = typeof value === 'string' ? new Date(value) : value
  return Date.now() - d.getTime() < SEVEN_DAYS_MS
}
