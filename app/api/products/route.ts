import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(1, "商品名を入力してください"),
  sku: z.string().min(1, "SKUを入力してください"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "カテゴリを選択してください"),
  price: z.number().min(0, "価格は0以上である必要があります"),
  currentStock: z.number().int().min(0, "在庫数は0以上である必要があります"),
  minStockLevel: z.number().int().min(0, "最小在庫レベルは0以上である必要があります"),
})

// GET /api/products - 商品一覧取得
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const categoryId = searchParams.get("categoryId") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { sku: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {},
        categoryId ? { categoryId } : {},
      ],
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Products GET error:", error)
    return NextResponse.json(
      { error: "商品一覧の取得に失敗しました" },
      { status: 500 }
    )
  }
}

// POST /api/products - 商品登録
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = productSchema.parse(body)

    // SKUの重複チェック
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: "このSKUは既に登録されています" },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data,
      include: {
        category: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Product POST error:", error)
    return NextResponse.json(
      { error: "商品の登録に失敗しました" },
      { status: 500 }
    )
  }
}
