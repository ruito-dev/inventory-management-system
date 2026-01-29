import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, '商品名は必須です'),
  sku: z.string().min(1, 'SKUは必須です'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'カテゴリーは必須です'),
  price: z.number().min(0, '価格は0以上である必要があります'),
  currentStock: z.number().int().min(0, '在庫数は0以上の整数である必要があります'),
  minStockLevel: z.number().int().min(0, '最小在庫数は0以上の整数である必要があります'),
})

// GET /api/products/[id] - 商品詳細取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('商品詳細取得エラー:', error)
    return NextResponse.json(
      { error: '商品詳細の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - 商品更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = productSchema.parse(body)

    // 商品の存在確認
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      )
    }

    // SKUの重複チェック（自分以外）
    if (data.sku !== existingProduct.sku) {
      const duplicateSku = await prisma.product.findUnique({
        where: { sku: data.sku },
      })

      if (duplicateSku) {
        return NextResponse.json(
          { error: 'このSKUは既に登録されています' },
          { status: 400 }
        )
      }
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
      include: {
        category: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('商品更新エラー:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: '商品の更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - 商品削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // 商品の存在確認
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      )
    }

    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: '商品を削除しました' })
  } catch (error) {
    console.error('商品削除エラー:', error)
    return NextResponse.json(
      { error: '商品の削除に失敗しました' },
      { status: 500 }
    )
  }
}
