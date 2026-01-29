import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash, compare } from 'bcryptjs'
import { z } from 'zod'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, '現在のパスワードは必須です'),
  newPassword: z.string().min(8, 'パスワードは8文字以上である必要があります'),
})

export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = passwordSchema.parse(body)

    // 現在のユーザーを取得
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    // 現在のパスワードを検証
    const isPasswordValid = await compare(validatedData.currentPassword, currentUser.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: '現在のパスワードが正しくありません' }, { status: 400 })
    }

    // 新しいパスワードをハッシュ化
    const hashedPassword = await hash(validatedData.newPassword, 10)

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json({ message: 'パスワードを変更しました' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('パスワード変更エラー:', error)
    return NextResponse.json({ error: 'パスワードの変更に失敗しました' }, { status: 500 })
  }
}
