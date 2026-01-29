import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const stockTransactionSchema = z.object({
  productId: z.string().min(1, '商品は必須です'),
  type: z.enum(['IN', 'OUT'], { message: '取引タイプは必須です' }),
  quantity: z.number().int().min(1, '数量は1以上である必要があります'),
  reason: z.string().min(1, '理由は必須です'),
})

// GET /api/stock-transactions - 在庫取引一覧取得
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId') || ''
    const type = searchParams.get('type') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: {
      productId?: string
      type?: 'IN' | 'OUT'
      createdAt?: {
        gte?: Date
        lte?: Date
      }
    } = {}

    if (productId) {
      where.productId = productId
    }

    if (type && (type === 'IN' || type === 'OUT')) {
      where.type = type
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where,
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.stockTransaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('在庫取引一覧取得エラー:', error)
    return NextResponse.json({ error: '在庫取引一覧の取得に失敗しました' }, { status: 500 })
  }
}

// POST /api/stock-transactions - 在庫取引登録
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const data = stockTransactionSchema.parse(body)

    // 商品の存在確認
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    })

    if (!product) {
      return NextResponse.json({ error: '商品が見つかりません' }, { status: 404 })
    }

    // 出庫の場合、在庫数をチェック
    if (data.type === 'OUT' && product.currentStock < data.quantity) {
      return NextResponse.json({ error: '在庫数が不足しています' }, { status: 400 })
    }

    // トランザクションで在庫取引と在庫数を更新
    const result = await prisma.$transaction(async (tx) => {
      // 在庫取引を作成
      const transaction = await tx.stockTransaction.create({
        data: {
          productId: data.productId,
          type: data.type,
          quantity: data.quantity,
          reason: data.reason,
          userId: session.user.id,
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      })

      // 在庫数を更新
      const newStock =
        data.type === 'IN'
          ? product.currentStock + data.quantity
          : product.currentStock - data.quantity

      await tx.product.update({
        where: { id: data.productId },
        data: { currentStock: newStock },
      })

      return transaction
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('在庫取引登録エラー:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: '在庫取引の登録に失敗しました' }, { status: 500 })
  }
}
