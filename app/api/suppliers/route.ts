import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const supplierSchema = z.object({
  name: z.string().min(1, '仕入先名は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
})

// GET /api/suppliers - 仕入先一覧取得
export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const suppliers = await prisma.supplier.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('仕入先一覧取得エラー:', error)
    return NextResponse.json(
      { error: '仕入先一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST /api/suppliers - 仕入先登録
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
    const data = supplierSchema.parse(body)

    // 空文字列をnullに変換
    const supplierData = {
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
    }

    const supplier = await prisma.supplier.create({
      data: supplierData,
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('仕入先登録エラー:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: '仕入先の登録に失敗しました' },
      { status: 500 }
    )
  }
}
