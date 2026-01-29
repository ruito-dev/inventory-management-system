import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const stockFilter = searchParams.get('stockFilter') || 'all'

    const skip = (page - 1) * limit

    // 検索条件の構築
    const where: {
      OR?: Array<{ name?: { contains: string }; sku?: { contains: string } }>
      currentStock?: { lte?: number; equals?: number }
    } = {}

    if (search) {
      where.OR = [{ name: { contains: search } }, { sku: { contains: search } }]
    }

    // 在庫フィルター
    if (stockFilter === 'low') {
      // 在庫少: currentStock <= minStockLevel かつ currentStock > 0
      // Prismaでは直接フィールド比較ができないため、全件取得後にフィルタリング
    } else if (stockFilter === 'out') {
      where.currentStock = { equals: 0 }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    // 在庫少フィルターの場合、クライアント側でフィルタリング
    let filteredProducts = products
    if (stockFilter === 'low') {
      filteredProducts = products.filter(
        (p) => p.currentStock > 0 && p.currentStock <= p.minStockLevel
      )
    }

    return NextResponse.json({
      products: filteredProducts,
      total: stockFilter === 'low' ? filteredProducts.length : total,
      page,
      totalPages: Math.ceil((stockFilter === 'low' ? filteredProducts.length : total) / limit),
    })
  } catch (error) {
    console.error('在庫情報取得エラー:', error)
    return NextResponse.json({ error: '在庫情報の取得に失敗しました' }, { status: 500 })
  }
}
