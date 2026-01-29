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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const supplierSchema = z.object({
  name: z.string().min(1, '仕入先名は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type SupplierFormData = z.infer<typeof supplierSchema>

interface Supplier {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  createdAt: string
  updatedAt: string
}

export default function SuppliersPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/suppliers')
      if (!response.ok) {
        throw new Error('仕入先の取得に失敗しました')
      }
      const data = await response.json()
      setSuppliers(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '仕入先の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: SupplierFormData) => {
    try {
      setSubmitting(true)
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '仕入先の登録に失敗しました')
      }

      toast.success('仕入先を登録しました')
      setDialogOpen(false)
      reset()
      fetchSuppliers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '仕入先の登録に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <PageHeader
        title="仕入先管理"
        description="仕入先の登録・管理を行います"
      />

      <div className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新規登録
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>仕入先登録</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    仕入先名 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="例: 株式会社サンプル商事"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="例: info@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">電話番号</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="例: 03-1234-5678"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">住所</Label>
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="例: 東京都渋谷区..."
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address.message}</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? '登録中...' : '登録する'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={submitting}
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>仕入先名</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>電話番号</TableHead>
                <TableHead>住所</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    仕入先が登録されていません
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.email || '-'}</TableCell>
                    <TableCell>{supplier.phone || '-'}</TableCell>
                    <TableCell>{supplier.address || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  )
}
