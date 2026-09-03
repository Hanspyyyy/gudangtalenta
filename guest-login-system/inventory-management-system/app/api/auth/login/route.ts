import { NextResponse } from 'next/server'
import { AUTH_COOKIE, findAdmin, signSession } from '@/lib/auth-config'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const admin = findAdmin(email, password)
  if (!admin) return NextResponse.json({ error: 'Email atau kata sandi salah.' }, { status: 401 })

  const response = NextResponse.json({ ok: true })
  response.cookies.set(AUTH_COOKIE, signSession('admin', admin.email), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
