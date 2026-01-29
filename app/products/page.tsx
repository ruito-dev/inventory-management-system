'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  price: number
  currentStock: number
  minStockLevel: number
  category: Category
  createdAt: string
  updatedAt: string
}

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      })

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      if (selectedCategory && selectedCategory !== 'all') {
        params.append('categoryId', selectedCategory)
      }

      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) {
        throw new Error('商品の取得に失敗しました')
      }

      const data: ProductsResponse = await response.json()
      setProducts(data.products)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '商品の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery, selectedCategory])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('カテゴリーの取得に失敗しました')
      }
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('カテゴリーの取得エラー:', error)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPage(1)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この商品を削除してもよろしいですか？')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('商品の削除に失敗しました')
      }

      toast.success('商品を削除しました')
      fetchProducts()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '商品の削除に失敗しました')
    }
  }

  const getStockBadge = (currentStock: number, minStockLevel: number) => {
    if (currentStock === 0) {
      return <Badge variant="destructive">在庫なし</Badge>
    }
    if (currentStock <= minStockLevel) {
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

  return (
    <MainLayout>
      <PageHeader title="商品管理" description="商品の登録・編集・削除を行います" />

      <div className="space-y-4">
        {/* 検索・フィルター */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="商品名またはSKUで検索..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="カテゴリーで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのカテゴリー</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => router.push('/products/new')}>
            <Plus className="h-4 w-4 mr-2" />
            新規登録
          </Button>
        </div>

        {/* 商品テーブル */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>商品名</TableHead>
                <TableHead>カテゴリー</TableHead>
                <TableHead className="text-right">価格</TableHead>
                <TableHead className="text-right">在庫数</TableHead>
                <TableHead>在庫状況</TableHead>
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
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    商品が見つかりませんでした
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category.name}</TableCell>
                    <TableCell className="text-right">¥{product.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{product.currentStock}</TableCell>
                    <TableCell>
                      {getStockBadge(product.currentStock, product.minStockLevel)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/products/${product.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
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
              全{total}件中 {(currentPage - 1) * limit + 1}〜{Math.min(currentPage * limit, total)}
              件を表示
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
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
