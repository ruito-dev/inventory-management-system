import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // 公開ページ
  const publicPaths = ['/login', '/signup']
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // ログインしていない場合、保護されたページへのアクセスをブロック
  if (!isLoggedIn && !isPublicPath && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // ログイン済みの場合、ログイン/サインアップページへのアクセスをダッシュボードにリダイレクト
  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
