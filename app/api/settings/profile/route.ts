import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
})

export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = profileSchema.parse(body)

    // 現在のユーザーを取得
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    // メールアドレスが変更される場合、重複チェック
    if (validatedData.email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'このメールアドレスは既に使用されています' },
          { status: 400 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('プロフィール更新エラー:', error)
    return NextResponse.json({ error: 'プロフィールの更新に失敗しました' }, { status: 500 })
  }
}
