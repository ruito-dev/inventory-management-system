'use client'

import { useState, useEffect } from 'react'
import { MainLayout, PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { AlertTriangle, PackageX } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  sku: string
  currentStock: number
  minStockLevel: number
  category: Category
}

export default function StockAlertsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stock-alerts')
      if (!response.ok) throw new Error('在庫アラートの取得に失敗しました')

      const data = await response.json()
      // outOfStockとlowStockを結合
      const allAlerts = [...data.outOfStock, ...data.lowStock]
      setProducts(allAlerts)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const getAlertBadge = (product: Product) => {
    if (product.currentStock === 0) {
      return (
        <Badge variant="outline" className="border-red-500 text-red-600">
          <PackageX className="h-3 w-3 mr-1" />
          在庫切れ
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="border-yellow-500 text-yellow-600">
        <AlertTriangle className="h-3 w-3 mr-1" />
        在庫少
      </Badge>
    )
  }

  return (
    <MainLayout>
      <PageHeader title="在庫アラート" description="在庫が少ない、または在庫切れの商品一覧" />

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">読み込み中...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">現在、在庫アラートはありません</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>{products.length}件の商品が在庫不足です</span>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>状態</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>商品名</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead className="text-right">現在庫</TableHead>
                    <TableHead className="text-right">最小在庫</TableHead>
                    <TableHead className="text-right">不足数</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const shortage = Math.max(0, product.minStockLevel - product.currentStock)
                    return (
                      <TableRow key={product.id}>
                        <TableCell>{getAlertBadge(product)}</TableCell>
                        <TableCell className="font-mono">{product.sku}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category.name}</TableCell>
                        <TableCell className="text-right font-medium">
                          {product.currentStock}
                        </TableCell>
                        <TableCell className="text-right">{product.minStockLevel}</TableCell>
                        <TableCell className="text-right text-red-600 font-medium">
                          {shortage}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/products/${product.id}`)}
                            >
                              詳細
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => router.push('/purchase-orders/new')}
                            >
                              発注
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}
