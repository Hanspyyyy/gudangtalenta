import { NextResponse } from 'next/server'
import { AUTH_COOKIE, signSession } from '@/lib/auth-config'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(AUTH_COOKIE, signSession('guest'), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24,
  })
  return response
}
