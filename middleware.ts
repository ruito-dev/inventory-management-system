import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 公開ページ
  const publicPaths = ['/login', '/signup']
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // JWTトークンを取得（Edge Runtimeで動作）
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isLoggedIn = !!token

  // ログインしていない場合、保護されたページへのアクセスをブロック
  if (!isLoggedIn && !isPublicPath && pathname !== '/') {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ログイン済みの場合、ログイン/サインアップページへのアクセスをダッシュボードにリダイレクト
  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

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
