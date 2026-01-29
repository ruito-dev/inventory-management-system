import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/purchase-orders/[id]/receive - 入荷処理
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 発注の存在確認
    const existingOrder = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
      include: {
        items: true,
      },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: '発注が見つかりません' }, { status: 404 })
    }

    // 既に入荷済みの場合はエラー
    if (existingOrder.status === 'RECEIVED') {
      return NextResponse.json({ error: 'この発注は既に入荷済みです' }, { status: 400 })
    }

    // キャンセル済みの場合はエラー
    if (existingOrder.status === 'CANCELLED') {
      return NextResponse.json({ error: 'キャンセル済みの発注は入荷できません' }, { status: 400 })
    }

    // トランザクションで発注ステータスと在庫を更新
    const result = await prisma.$transaction(async (tx) => {
      // 発注ステータスを入荷済みに更新
      const order = await tx.purchaseOrder.update({
        where: { id: params.id },
        data: { status: 'RECEIVED' },
        include: {
          supplier: true,
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      })

      // 各商品の在庫を更新
      for (const item of existingOrder.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        })

        if (product) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: product.currentStock + item.quantity,
            },
          })

          // 在庫取引履歴を作成
          await tx.stockTransaction.create({
            data: {
              productId: item.productId,
              type: 'IN',
              quantity: item.quantity,
              reason: `発注入荷 (発注ID: ${params.id})`,
              userId: session.user.id,
            },
          })
        }
      }

      return order
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('入荷処理エラー:', error)
    return NextResponse.json({ error: '入荷処理に失敗しました' }, { status: 500 })
  }
}
