import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/reports/statistics - レポート統計取得
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // 日付範囲の設定
    const dateFilter = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    }

    // カテゴリ別在庫状況
    const categories = await prisma.category.findMany({
      include: {
        products: {
          select: {
            currentStock: true,
            minStockLevel: true,
          },
        },
      },
    })

    const categoryStats = categories.map((category) => ({
      name: category.name,
      totalStock: category.products.reduce((sum, p) => sum + p.currentStock, 0),
      productCount: category.products.length,
      lowStockCount: category.products.filter((p) => p.currentStock <= p.minStockLevel).length,
    }))

    // 在庫取引統計（期間別）
    const transactions = await prisma.stockTransaction.findMany({
      where: {
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
      },
      include: {
        product: true,
      },
    })

    const transactionStats = {
      totalIn: transactions.filter((t) => t.type === 'IN').reduce((sum, t) => sum + t.quantity, 0),
      totalOut: transactions
        .filter((t) => t.type === 'OUT')
        .reduce((sum, t) => sum + t.quantity, 0),
      byType: {
        IN: transactions.filter((t) => t.type === 'IN').length,
        OUT: transactions.filter((t) => t.type === 'OUT').length,
      },
    }

    // 発注統計（仕入先別）
    const supplierStats = await prisma.supplier.findMany({
      include: {
        purchaseOrders: {
          where: {
            orderDate: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
          },
        },
      },
    })

    const supplierOrderStats = supplierStats.map((supplier) => ({
      name: supplier.name,
      orderCount: supplier.purchaseOrders.length,
      totalAmount: supplier.purchaseOrders.reduce(
        (sum, order) => sum + Number(order.totalAmount),
        0
      ),
    }))

    // 月別在庫取引推移（直近6ヶ月）
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyTransactions = await prisma.stockTransaction.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
    })

    const monthlyStats = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - i))
      const year = date.getFullYear()
      const month = date.getMonth() + 1

      const monthTransactions = monthlyTransactions.filter((t) => {
        const tDate = new Date(t.createdAt)
        return tDate.getFullYear() === year && tDate.getMonth() + 1 === month
      })

      return {
        month: `${year}/${month}`,
        in: monthTransactions
          .filter((t) => t.type === 'IN')
          .reduce((sum, t) => sum + t.quantity, 0),
        out: monthTransactions
          .filter((t) => t.type === 'OUT')
          .reduce((sum, t) => sum + t.quantity, 0),
      }
    })

    return NextResponse.json({
      categoryStats,
      transactionStats,
      supplierOrderStats,
      monthlyStats,
    })
  } catch (error) {
    console.error('統計取得エラー:', error)
    return NextResponse.json({ error: '統計の取得に失敗しました' }, { status: 500 })
  }
}
