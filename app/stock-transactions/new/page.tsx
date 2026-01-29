'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MainLayout, PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

const stockTransactionSchema = z.object({
  productId: z.string().min(1, '商品は必須です'),
  type: z.enum(['IN', 'OUT']),
  quantity: z.number().int().min(1, '数量は1以上である必要があります'),
  reason: z.string().min(1, '理由は必須です'),
})

type StockTransactionFormData = z.infer<typeof stockTransactionSchema>

interface Product {
  id: string
  name: string
  sku: string
  currentStock: number
  category: {
    id: string
    name: string
  }
}

export default function NewStockTransactionPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [transactionType, setTransactionType] = useState<'IN' | 'OUT'>('IN')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<StockTransactionFormData>({
    resolver: zodResolver(stockTransactionSchema),
    defaultValues: {
      type: 'IN',
    },
  })

  const productId = watch('productId')
  const selectedProduct = products.find((p) => p.id === productId)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    setValue('type', transactionType)
  }, [transactionType, setValue])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=1000')
      if (!response.ok) {
        throw new Error('商品の取得に失敗しました')
      }
      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '商品の取得に失敗しました')
    }
  }

  const onSubmit = async (data: StockTransactionFormData) => {
    try {
      setLoading(true)
      const response = await fetch('/api/stock-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '在庫取引の登録に失敗しました')
      }

      toast.success('在庫取引を登録しました')
      router.push('/stock-transactions')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '在庫取引の登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <PageHeader
        title="在庫取引登録"
        description="入庫・出庫を登録します"
      />

      <div className="max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.push('/stock-transactions')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          在庫取引履歴に戻る
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>取引情報</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={transactionType} onValueChange={(v) => setTransactionType(v as 'IN' | 'OUT')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="IN">入庫</TabsTrigger>
                <TabsTrigger value="OUT">出庫</TabsTrigger>
              </TabsList>

              <TabsContent value="IN">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="productId">
                      商品 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={productId}
                      onValueChange={(value) => setValue('productId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="商品を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku}) - 現在庫: {product.currentStock}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.productId && (
                      <p className="text-sm text-red-500">{errors.productId.message}</p>
                    )}
                  </div>

                  {selectedProduct && (
                    <div className="p-4 bg-muted rounded-md">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">カテゴリー:</span>{' '}
                          {selectedProduct.category.name}
                        </div>
                        <div>
                          <span className="text-muted-foreground">現在庫:</span>{' '}
                          {selectedProduct.currentStock}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      入庫数量 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      {...register('quantity', { valueAsNumber: true })}
                      placeholder="例: 50"
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-500">{errors.quantity.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">
                      理由 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => setValue('reason', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="理由を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="仕入れ">仕入れ</SelectItem>
                        <SelectItem value="返品受入">返品受入</SelectItem>
                        <SelectItem value="調整増">調整増</SelectItem>
                        <SelectItem value="その他">その他</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.reason && (
                      <p className="text-sm text-red-500">{errors.reason.message}</p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? '登録中...' : '入庫登録'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/stock-transactions')}
                      disabled={loading}
                    >
                      キャンセル
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="OUT">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="productId">
                      商品 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={productId}
                      onValueChange={(value) => setValue('productId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="商品を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku}) - 現在庫: {product.currentStock}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.productId && (
                      <p className="text-sm text-red-500">{errors.productId.message}</p>
                    )}
                  </div>

                  {selectedProduct && (
                    <div className="p-4 bg-muted rounded-md">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">カテゴリー:</span>{' '}
                          {selectedProduct.category.name}
                        </div>
                        <div>
                          <span className="text-muted-foreground">現在庫:</span>{' '}
                          <span className={selectedProduct.currentStock === 0 ? 'text-red-500 font-medium' : ''}>
                            {selectedProduct.currentStock}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      出庫数量 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      {...register('quantity', { valueAsNumber: true })}
                      placeholder="例: 10"
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-500">{errors.quantity.message}</p>
                    )}
                    {selectedProduct && (
                      <p className="text-sm text-muted-foreground">
                        ※ 現在庫: {selectedProduct.currentStock}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">
                      理由 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => setValue('reason', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="理由を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="販売">販売</SelectItem>
                        <SelectItem value="返品">返品</SelectItem>
                        <SelectItem value="調整減">調整減</SelectItem>
                        <SelectItem value="廃棄">廃棄</SelectItem>
                        <SelectItem value="その他">その他</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.reason && (
                      <p className="text-sm text-red-500">{errors.reason.message}</p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? '登録中...' : '出庫登録'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/stock-transactions')}
                      disabled={loading}
                    >
                      キャンセル
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
