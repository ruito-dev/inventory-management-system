import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'カテゴリ名は必須です'),
  description: z.string().optional(),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = categorySchema.parse(body)

    const category = await prisma.category.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('カテゴリー更新エラー:', error)
    return NextResponse.json({ error: 'カテゴリーの更新に失敗しました' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { id } = await params

    // カテゴリに紐づく商品があるかチェック
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    })

    if (productsCount > 0) {
      return NextResponse.json(
        { error: 'このカテゴリには商品が登録されているため削除できません' },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'カテゴリを削除しました' })
  } catch (error) {
    console.error('カテゴリー削除エラー:', error)
    return NextResponse.json({ error: 'カテゴリーの削除に失敗しました' }, { status: 500 })
  }
}
