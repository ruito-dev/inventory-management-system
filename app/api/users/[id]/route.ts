import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params

    // 自分自身を削除しようとしていないかチェック
    if (session.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      })

      if (currentUser?.id === id) {
        return NextResponse.json({ error: '自分自身を削除することはできません' }, { status: 400 })
      }
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'ユーザーを削除しました' })
  } catch (error) {
    console.error('ユーザー削除エラー:', error)
    return NextResponse.json({ error: 'ユーザーの削除に失敗しました' }, { status: 500 })
  }
}
