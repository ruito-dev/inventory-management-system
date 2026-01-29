'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout, PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Package } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Product {
  id: string
  name: string
  sku: string
  category: {
    name: string
  }
}

interface PurchaseOrderItem {
  id: string
  quantity: number
  unitPrice: number
  product: Product
}

interface Supplier {
  id: string
  name: string
  email: string | null
  phone: string | null
}

interface PurchaseOrder {
  id: string
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED'
  orderDate: string
  expectedDate: string | null
  totalAmount: number
  supplier: Supplier
  items: PurchaseOrderItem[]
}

export default function PurchaseOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/purchase-orders/${orderId}`)
      if (!response.ok) {
        throw new Error('発注の取得に失敗しました')
      }
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '発注の取得に失敗しました')
      router.push('/purchase-orders')
    } finally {
      setLoading(false)
    }
  }

  const handleReceive = async () => {
    if (!confirm('この発注を入荷済みにしますか？在庫が自動的に更新されます。')) {
      return
    }

    try {
      setProcessing(true)
      const response = await fetch(`/api/purchase-orders/${orderId}/receive`, {
        method: 'PUT',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '入荷処理に失敗しました')
      }

      toast.success('入荷処理が完了しました')
      fetchOrder()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '入荷処理に失敗しました')
    } finally {
      setProcessing(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('この発注をキャンセルしますか？')) {
      return
    }

    try {
      setProcessing(true)
      const response = await fetch(`/api/purchase-orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'キャンセル処理に失敗しました')
      }

      toast.success('発注をキャンセルしました')
      fetchOrder()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'キャンセル処理に失敗しました')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: 'PENDING' | 'RECEIVED' | 'CANCELLED') => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">発注中</Badge>
      case 'RECEIVED':
        return <Badge variant="outline" className="border-green-500 text-green-600">入荷済み</Badge>
      case 'CANCELLED':
        return <Badge variant="outline" className="border-gray-500 text-gray-600">キャンセル</Badge>
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p>読み込み中...</p>
        </div>
      </MainLayout>
    )
  }

  if (!order) {
    return null
  }

  return (
    <MainLayout>
      <PageHeader title="発注詳細" description="発注の詳細情報を確認します" />

      <div className="max-w-4xl space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/purchase-orders')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          発注一覧に戻る
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>発注情報</CardTitle>
              {getStatusBadge(order.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">仕入先</div>
                <div className="font-medium">{order.supplier.name}</div>
                {order.supplier.email && (
                  <div className="text-sm text-muted-foreground">{order.supplier.email}</div>
                )}
                {order.supplier.phone && (
                  <div className="text-sm text-muted-foreground">{order.supplier.phone}</div>
                )}
              </div>

              <div>
                <div className="text-sm text-muted-foreground">発注日</div>
                <div className="font-medium">
                  {format(new Date(order.orderDate), 'yyyy年MM月dd日', { locale: ja })}
                </div>
                {order.expectedDate && (
                  <>
                    <div className="text-sm text-muted-foreground mt-2">納期</div>
                    <div className="font-medium">
                      {format(new Date(order.expectedDate), 'yyyy年MM月dd日', { locale: ja })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>発注商品</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商品名</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>カテゴリー</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead className="text-right">単価</TableHead>
                  <TableHead className="text-right">小計</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product.name}</TableCell>
                    <TableCell className="font-mono text-sm">{item.product.sku}</TableCell>
                    <TableCell>{item.product.category.name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      ¥{Number(item.unitPrice).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ¥{(item.quantity * Number(item.unitPrice)).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end pt-4 border-t mt-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">合計金額</div>
                <div className="text-2xl font-bold">
                  ¥{Number(order.totalAmount).toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {order.status === 'PENDING' && (
          <div className="flex gap-4">
            <Button onClick={handleReceive} disabled={processing}>
              <Package className="h-4 w-4 mr-2" />
              {processing ? '処理中...' : '入荷処理'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={processing}
            >
              キャンセル
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
