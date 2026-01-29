'use client'

import { useState, useEffect, useCallback } from 'react'
import { MainLayout, PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

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

interface StockResponse {
  products: Product[]
  total: number
  page: number
  totalPages: number
}

export default function StockPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        search: searchTerm,
      })

      if (stockFilter !== 'all') {
        params.append('stockFilter', stockFilter)
      }

      const response = await fetch(`/api/stock?${params}`)
      if (!response.ok) throw new Error('在庫情報の取得に失敗しました')

      const data: StockResponse = await response.json()
      setProducts(data.products)
      setTotalPages(data.totalPages)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm, stockFilter])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const getStockBadge = (product: Product) => {
    if (product.currentStock === 0) {
      return (
        <Badge variant="outline" className="border-red-500 text-red-600">
          在庫切れ
        </Badge>
      )
    }
    if (product.currentStock <= product.minStockLevel) {
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
          在庫少
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="border-green-500 text-green-600">
        在庫あり
      </Badge>
    )
  }

  const handleSearch = () => {
    setPage(1)
    fetchProducts()
  }

  const handleStockFilterChange = (value: string) => {
    setStockFilter(value)
    setPage(1)
  }

  return (
    <MainLayout>
      <PageHeader title="在庫一覧" description="商品の在庫状況を確認" />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 flex-1">
            <Input
              placeholder="商品名またはSKUで検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>検索</Button>
          </div>

          <Select value={stockFilter} onValueChange={handleStockFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="在庫状況" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="low">在庫少</SelectItem>
              <SelectItem value="out">在庫切れ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>商品名</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead className="text-right">現在庫</TableHead>
                <TableHead className="text-right">最小在庫</TableHead>
                <TableHead>状態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    商品が見つかりませんでした
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category.name}</TableCell>
                    <TableCell className="text-right font-medium">{product.currentStock}</TableCell>
                    <TableCell className="text-right">{product.minStockLevel}</TableCell>
                    <TableCell>{getStockBadge(product)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/products/${product.id}`)}
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
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              前へ
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              次へ
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
