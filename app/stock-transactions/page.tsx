'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout, PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Plus, ArrowUp, ArrowDown } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Product {
  id: string
  name: string
  sku: string
  category: {
    id: string
    name: string
  }
}

interface StockTransaction {
  id: string
  type: 'IN' | 'OUT'
  quantity: number
  reason: string
  createdAt: string
  product: Product
}

interface TransactionsResponse {
  transactions: StockTransaction[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function StockTransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, selectedType, startDate, endDate])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      })

      if (selectedType && selectedType !== 'all') {
        params.append('type', selectedType)
      }

      if (startDate) {
        params.append('startDate', startDate)
      }

      if (endDate) {
        params.append('endDate', endDate)
      }

      const response = await fetch(`/api/stock-transactions?${params}`)
      if (!response.ok) {
        throw new Error('在庫取引の取得に失敗しました')
      }

      const data: TransactionsResponse = await response.json()
      setTransactions(data.transactions)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('在庫取引取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (value: string) => {
    setSelectedType(value)
    setCurrentPage(1)
  }

  const handleDateFilter = () => {
    setCurrentPage(1)
    fetchTransactions()
  }

  const getTypeBadge = (type: 'IN' | 'OUT') => {
    if (type === 'IN') {
      return (
        <Badge variant="outline" className="border-green-500 text-green-600">
          <ArrowUp className="h-3 w-3 mr-1" />
          入庫
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="border-red-500 text-red-600">
        <ArrowDown className="h-3 w-3 mr-1" />
        出庫
      </Badge>
    )
  }

  return (
    <MainLayout>
      <PageHeader
        title="在庫取引履歴"
        description="入庫・出庫の履歴を確認します"
      />

      <div className="space-y-4">
        {/* フィルター */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="取引タイプで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての取引</SelectItem>
              <SelectItem value="IN">入庫のみ</SelectItem>
              <SelectItem value="OUT">出庫のみ</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 flex-1">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="開始日"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="終了日"
            />
            <Button onClick={handleDateFilter} variant="outline">
              絞り込み
            </Button>
          </div>

          <Button onClick={() => router.push('/stock-transactions/new')}>
            <Plus className="h-4 w-4 mr-2" />
            新規登録
          </Button>
        </div>

        {/* 取引テーブル */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日時</TableHead>
                <TableHead>取引タイプ</TableHead>
                <TableHead>商品名</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>カテゴリー</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead>理由</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    在庫取引が見つかりませんでした
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.createdAt), 'yyyy/MM/dd HH:mm', {
                        locale: ja,
                      })}
                    </TableCell>
                    <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                    <TableCell className="font-medium">
                      {transaction.product.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {transaction.product.sku}
                    </TableCell>
                    <TableCell>{transaction.product.category.name}</TableCell>
                    <TableCell className="text-right font-medium">
                      {transaction.type === 'IN' ? '+' : '-'}
                      {transaction.quantity}
                    </TableCell>
                    <TableCell>{transaction.reason}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ページネーション */}
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
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page
                  if (totalPages <= 5) {
                    page = i + 1
                  } else if (currentPage <= 3) {
                    page = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i
                  } else {
                    page = currentPage - 2 + i
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>
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
