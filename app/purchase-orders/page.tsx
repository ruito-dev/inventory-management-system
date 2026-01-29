'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Supplier {
  id: string
  name: string
}

interface PurchaseOrder {
  id: string
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED'
  orderDate: string
  expectedDate: string | null
  totalAmount: number
  supplier: Supplier
  items: Array<{
    id: string
    quantity: number
  }>
}

interface OrdersResponse {
  orders: PurchaseOrder[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  useEffect(() => {
    fetchOrders()
  }, [currentPage, selectedStatus])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      })

      if (selectedStatus && selectedStatus !== 'all') {
        params.append('status', selectedStatus)
      }

      const response = await fetch(`/api/purchase-orders?${params}`)
      if (!response.ok) {
        throw new Error('発注の取得に失敗しました')
      }

      const data: OrdersResponse = await response.json()
      setOrders(data.orders)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('発注取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
    setCurrentPage(1)
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

  return (
    <MainLayout>
      <PageHeader
        title="発注管理"
        description="発注の登録・管理を行います"
      />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="ステータスで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての発注</SelectItem>
              <SelectItem value="PENDING">発注中</SelectItem>
              <SelectItem value="RECEIVED">入荷済み</SelectItem>
              <SelectItem value="CANCELLED">キャンセル</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => router.push('/purchase-orders/new')} className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            新規発注
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>発注日</TableHead>
                <TableHead>仕入先</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>納期</TableHead>
                <TableHead className="text-right">合計金額</TableHead>
                <TableHead className="text-right">商品数</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    発注が見つかりませんでした
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      {format(new Date(order.orderDate), 'yyyy/MM/dd', { locale: ja })}
                    </TableCell>
                    <TableCell className="font-medium">{order.supplier.name}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {order.expectedDate
                        ? format(new Date(order.expectedDate), 'yyyy/MM/dd', { locale: ja })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      ¥{Number(order.totalAmount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{order.items.length}点</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/purchase-orders/${order.id}`)}
                      >
                        詳細
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              全{total}件中 {(currentPage - 1) * limit + 1}〜
              {Math.min(currentPage * limit, total)}件を表示
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                前へ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                次へ
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
