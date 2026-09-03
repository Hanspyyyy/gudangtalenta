import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AUTH_COOKIE, GUEST_PROFILE, readSession } from '@/lib/auth-config'
import { isAdminRole, type Profile } from '@/lib/types'

export async function getProfile(): Promise<Profile | null> {
  const cookieStore = await cookies()
  const session = readSession(cookieStore.get(AUTH_COOKIE)?.value)
  if (!session) return null
  if (session.role === 'guest') return GUEST_PROFILE
  return {
    id: session.email || 'admin',
    full_name: 'Admin Talenta',
    role: 'admin',
    is_active: true,
    created_at: '',
    updated_at: '',
  }
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile()
  if (!profile) redirect('/auth/login')
  return profile
}

export async function assertAdmin(): Promise<Profile> {
  const profile = await getProfile()
  if (!profile || !profile.is_active) throw new Error('UNAUTHORIZED')
  if (!isAdminRole(profile.role)) throw new Error('FORBIDDEN')
  return profile
}

export async function requireAdminPage(): Promise<Profile> {
  const profile = await requireProfile()
  if (!isAdminRole(profile.role)) redirect('/')
  return profile
}
