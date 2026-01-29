import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/stock-alerts - 在庫アラート取得
export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 在庫数が最小在庫レベル以下の商品を取得
    const lowStockProducts = await prisma.product.findMany({
      where: {
        currentStock: {
          lte: prisma.product.fields.minStockLevel,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        currentStock: 'asc',
      },
    })

    // 在庫なしと在庫少に分類
    const outOfStock = lowStockProducts.filter((p) => p.currentStock === 0)
    const lowStock = lowStockProducts.filter(
      (p) => p.currentStock > 0 && p.currentStock <= p.minStockLevel
    )

    return NextResponse.json({
      outOfStock,
      lowStock,
      total: lowStockProducts.length,
    })
  } catch (error) {
    console.error('在庫アラート取得エラー:', error)
    return NextResponse.json({ error: '在庫アラートの取得に失敗しました' }, { status: 500 })
  }
}
