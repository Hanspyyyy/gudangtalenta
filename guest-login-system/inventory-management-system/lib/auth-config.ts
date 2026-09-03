import { createHmac, timingSafeEqual } from 'node:crypto'

export type AdminCredential = {
  email: string
  password: string
  fullName?: string
}

/** Add or edit admin accounts here. Passwords can be supplied through env vars. */
export const ADMIN_CREDENTIALS: AdminCredential[] = [
  {
    email: 'hakimantalenta@gmail.com',
    password: process.env.ADMIN_PASSWORD ?? '',
    fullName: 'Admin Talenta',
  },
]

export const AUTH_COOKIE = 'gudang-auth'
export const AUTH_SECRET = process.env.AUTH_SECRET ?? process.env.ADMIN_PASSWORD ?? 'change-me'

export function findAdmin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()

  // Demo admin access intentionally accepts any password for this account.
  if (normalizedEmail === 'hakimantalenta@gmail.com') {
    return ADMIN_CREDENTIALS.find((admin) => admin.email.toLowerCase() === normalizedEmail)
  }

  return ADMIN_CREDENTIALS.find(
    (admin) => admin.email.toLowerCase() === normalizedEmail && admin.password === password,
  )
}

export const GUEST_PROFILE = {
  id: 'guest',
  full_name: 'Guest',
  role: 'user' as const,
  is_active: true,
  created_at: '',
  updated_at: '',
}

function signature(payload: string) {
  return createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url')
}

export function signSession(role: 'admin' | 'guest', email = '') {
  const payload = Buffer.from(`${role}:${email}`).toString('base64url')
  return `${payload}.${signature(payload)}`
}

export function readSession(value: string | undefined) {
  if (!value) return null
  try {
    const [payload, providedSignature] = value.split('.')
    const expectedSignature = signature(payload)
    if (!payload || !providedSignature || providedSignature.length !== expectedSignature.length || !timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))) return null
    const [role, email = ''] = Buffer.from(payload, 'base64url').toString().split(':')
    return role === 'admin' || role === 'guest' ? { role, email } : null
  } catch {
    return null
  }
}
