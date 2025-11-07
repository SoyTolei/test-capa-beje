// middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define las rutas protegidas aquí
  const protectedRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/admin') ||
    path.startsWith('/course')

  // Si no es protegida, deja pasar
  if (!protectedRoute) return NextResponse.next()

  // ¿Hay cookies de autenticación de Supabase?
  const hasAuthCookies = request.cookies
    .getAll()
    .some(c => c.name.includes('sb-') && c.name.includes('-auth-token'))

  if (!hasAuthCookies) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Hay cookies: deja pasar (la validación "seria" se hace en el servidor de la página)
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|ico|map)).*)'],
}