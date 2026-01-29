import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 総商品数
    const totalProducts = await prisma.product.count()

    // 在庫切れ商品数
    const outOfStockProducts = await prisma.product.count({
      where: {
        currentStock: 0,
      },
    })

    // 発注中の件数
    const pendingOrders = await prisma.purchaseOrder.count({
      where: {
        status: 'PENDING',
      },
    })

    // 今月の入出庫数
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthlyTransactions = await prisma.stockTransaction.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    })

    // 在庫アラート（最小在庫レベル以下の商品）
    const lowStockProducts = await prisma.product.findMany({
      where: {
        currentStock: {
          lte: prisma.product.fields.minStockLevel,
        },
      },
      include: {
        category: true,
      },
      take: 5,
      orderBy: {
        currentStock: 'asc',
      },
    })

    // 最近の在庫取引
    const recentTransactions = await prisma.stockTransaction.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        product: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      stats: {
        totalProducts,
        outOfStockProducts,
        pendingOrders,
        monthlyTransactions,
      },
      lowStockProducts,
      recentTransactions,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: '統計情報の取得に失敗しました' }, { status: 500 })
  }
}
