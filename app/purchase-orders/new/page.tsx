'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1, '商品は必須です'),
  quantity: z.number().int().min(1, '数量は1以上である必要があります'),
  unitPrice: z.number().min(0, '単価は0以上である必要があります'),
})

const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, '仕入先は必須です'),
  expectedDate: z.string().min(1, '納期は必須です'),
  items: z.array(purchaseOrderItemSchema).min(1, '商品を1つ以上選択してください'),
})

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>

interface Supplier {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  sku: string
  price: number
}

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      items: [{ productId: '', quantity: 1, unitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const supplierId = watch('supplierId')
  const items = watch('items')

  useEffect(() => {
    fetchSuppliers()
    fetchProducts()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      if (!response.ok) throw new Error('仕入先の取得に失敗しました')
      const data = await response.json()
      setSuppliers(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '仕入先の取得に失敗しました')
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=1000')
      if (!response.ok) throw new Error('商品の取得に失敗しました')
      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '商品の取得に失敗しました')
    }
  }

  const handleProductChange = (index: number, productId: string) => {
    setValue(`items.${index}.productId`, productId)
    const product = products.find((p) => p.id === productId)
    if (product) {
      setValue(`items.${index}.unitPrice`, Number(product.price))
    }
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.quantity || 0) * (item.unitPrice || 0)
    }, 0)
  }

  const onSubmit = async (data: PurchaseOrderFormData) => {
    try {
      setLoading(true)
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '発注の登録に失敗しました')
      }

      toast.success('発注を登録しました')
      router.push('/purchase-orders')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '発注の登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <PageHeader title="発注登録" description="新しい発注を登録します" />

      <div className="max-w-4xl">
        <Button variant="ghost" onClick={() => router.push('/purchase-orders')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          発注一覧に戻る
        </Button>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>発注情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplierId">
                    仕入先 <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={supplierId}
                    onValueChange={(value) => setValue('supplierId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="仕入先を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.supplierId && (
                    <p className="text-sm text-red-500">{errors.supplierId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedDate">
                    納期 <span className="text-red-500">*</span>
                  </Label>
                  <Input id="expectedDate" type="date" {...register('expectedDate')} />
                  {errors.expectedDate && (
                    <p className="text-sm text-red-500">{errors.expectedDate.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>発注商品</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <Label>
                      商品 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={items[index]?.productId || ''}
                      onValueChange={(value) => handleProductChange(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="商品を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.items?.[index]?.productId && (
                      <p className="text-sm text-red-500">
                        {errors.items[index]?.productId?.message}
                      </p>
                    )}
                  </div>

                  <div className="w-24 space-y-2">
                    <Label>
                      数量 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      placeholder="数量"
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-sm text-red-500">
                        {errors.items[index]?.quantity?.message}
                      </p>
                    )}
                  </div>

                  <div className="w-32 space-y-2">
                    <Label>
                      単価 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                      placeholder="単価"
                    />
                    {errors.items?.[index]?.unitPrice && (
                      <p className="text-sm text-red-500">
                        {errors.items[index]?.unitPrice?.message}
                      </p>
                    )}
                  </div>

                  <div className="w-32 space-y-2">
                    <Label>小計</Label>
                    <div className="h-10 flex items-center text-sm font-medium">
                      ¥
                      {(
                        (items[index]?.quantity || 0) * (items[index]?.unitPrice || 0)
                      ).toLocaleString()}
                    </div>
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="mt-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                商品を追加
              </Button>

              {errors.items && typeof errors.items.message === 'string' && (
                <p className="text-sm text-red-500">{errors.items.message}</p>
              )}

              <div className="flex justify-end pt-4 border-t">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">合計金額</div>
                  <div className="text-2xl font-bold">¥{calculateTotal().toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? '登録中...' : '発注する'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/purchase-orders')}
              disabled={loading}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
