import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/purchase-orders/[id] - 発注詳細取得
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const order = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
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

    if (!order) {
      return NextResponse.json({ error: '発注が見つかりません' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('発注詳細取得エラー:', error)
    return NextResponse.json({ error: '発注詳細の取得に失敗しました' }, { status: 500 })
  }
}

// PUT /api/purchase-orders/[id] - 発注ステータス更新
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['PENDING', 'RECEIVED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: '無効なステータスです' }, { status: 400 })
    }

    // 発注の存在確認
    const existingOrder = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: '発注が見つかりません' }, { status: 404 })
    }

    const order = await prisma.purchaseOrder.update({
      where: { id: params.id },
      data: { status },
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

    return NextResponse.json(order)
  } catch (error) {
    console.error('発注ステータス更新エラー:', error)
    return NextResponse.json({ error: '発注ステータスの更新に失敗しました' }, { status: 500 })
  }
}
