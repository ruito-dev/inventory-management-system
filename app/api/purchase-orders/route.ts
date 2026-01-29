import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1, '商品は必須です'),
  quantity: z.number().int().min(1, '数量は1以上である必要があります'),
  unitPrice: z.number().min(0, '単価は0以上である必要があります'),
})

const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, '仕入先は必須です'),
  expectedDate: z.string().min(1, '納期は必須です'),
  items: z.array(purchaseOrderItemSchema).min(1, '商品を1つ以上選択してください'),
})

// GET /api/purchase-orders - 発注一覧取得
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: {
      status?: 'PENDING' | 'RECEIVED' | 'CANCELLED'
    } = {}

    if (status && ['PENDING', 'RECEIVED', 'CANCELLED'].includes(status)) {
      where.status = status as 'PENDING' | 'RECEIVED' | 'CANCELLED'
    }

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
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
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.purchaseOrder.count({ where }),
    ])

    return NextResponse.json({
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('発注一覧取得エラー:', error)
    return NextResponse.json(
      { error: '発注一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST /api/purchase-orders - 発注登録
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = purchaseOrderSchema.parse(body)

    // 仕入先の存在確認
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    })

    if (!supplier) {
      return NextResponse.json(
        { error: '仕入先が見つかりません' },
        { status: 404 }
      )
    }

    // 商品の存在確認
    const productIds = data.items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: '存在しない商品が含まれています' },
        { status: 404 }
      )
    }

    // 合計金額を計算
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    )

    // トランザクションで発注と発注明細を作成
    const order = await prisma.$transaction(async (tx) => {
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          supplierId: data.supplierId,
          totalAmount,
          status: 'PENDING',
          expectedDate: new Date(data.expectedDate),
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
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

      return purchaseOrder
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('発注登録エラー:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: '発注の登録に失敗しました' },
      { status: 500 }
    )
  }
}
