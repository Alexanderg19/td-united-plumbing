import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'es'] as const
type Locale = typeof locales[number]

function getLocale(request: NextRequest): Locale {
  const acceptLang = request.headers.get('accept-language') ?? ''
  const preferred = acceptLang.split(',')[0].split('-')[0].toLowerCase()
  return (locales as readonly string[]).includes(preferred)
    ? (preferred as Locale)
    : 'en'
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasLocale = locales.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  )

  if (hasLocale) {
    // Set x-pathname so the root layout can read the locale for <html lang>
    const response = NextResponse.next()
    response.headers.set('x-pathname', pathname)
    return response
  }

  const locale = getLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next|api|favicon\\.ico).*)'],
}
