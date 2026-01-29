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
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

const productSchema = z.object({
  name: z.string().min(1, '商品名は必須です'),
  sku: z.string().min(1, 'SKUは必須です'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'カテゴリーは必須です'),
  price: z.number().min(0, '価格は0以上である必要があります'),
  currentStock: z.number().int().min(0, '在庫数は0以上の整数である必要があります'),
  minStockLevel: z.number().int().min(0, '最小在庫数は0以上の整数である必要があります'),
})

type ProductFormData = z.infer<typeof productSchema>

interface Category {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      categoryId: '',
      price: 0,
      currentStock: 0,
      minStockLevel: 0,
    },
  })

  const categoryId = watch('categoryId')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('カテゴリーの取得に失敗しました')
      }
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'カテゴリーの取得に失敗しました')
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true)
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '商品の登録に失敗しました')
      }

      toast.success('商品を登録しました')
      router.push('/products')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '商品の登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <PageHeader title="商品登録" description="新しい商品を登録します" />

      <div className="max-w-2xl">
        <Button variant="ghost" onClick={() => router.push('/products')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          商品一覧に戻る
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>商品情報</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div className="space-y-2">
                <Label htmlFor="name">
                  商品名 <span className="text-red-500">*</span>
                </Label>
                <Input id="name" {...register('name')} placeholder="例: ノートパソコン" />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">
                  SKU <span className="text-red-500">*</span>
                </Label>
                <Input id="sku" {...register('sku')} placeholder="例: LAPTOP-001" />
                <p className="text-sm text-muted-foreground">
                  商品を識別するための一意のコード（例: LAPTOP-001、PHONE-XYZ-123）
                </p>
                {errors.sku && <p className="text-sm text-red-500">{errors.sku.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <textarea
                  id="description"
                  {...register('description')}
                  placeholder="商品の説明を入力してください"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">
                  カテゴリー <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={categoryId}
                  onValueChange={(value) => setValue('categoryId', value, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-red-500">{errors.categoryId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">
                  価格 (円) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="例: 100000"
                />
                {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentStock">
                    現在の在庫数 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="currentStock"
                    type="number"
                    {...register('currentStock', { valueAsNumber: true })}
                    placeholder="例: 50"
                  />
                  {errors.currentStock && (
                    <p className="text-sm text-red-500">{errors.currentStock.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minStockLevel">
                    最小在庫数 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    {...register('minStockLevel', { valueAsNumber: true })}
                    placeholder="例: 10"
                  />
                  {errors.minStockLevel && (
                    <p className="text-sm text-red-500">{errors.minStockLevel.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? '登録中...' : '登録する'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/products')}
                  disabled={loading}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
