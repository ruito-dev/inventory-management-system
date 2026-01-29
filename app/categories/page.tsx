'use client'

import { useState, useEffect } from 'react'
import { MainLayout, PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  description: string | null
  _count: {
    products: number
  }
}

interface CategoryFormData {
  name: string
  description: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (editingCategory) {
      setValue('name', editingCategory.name)
      setValue('description', editingCategory.description || '')
    } else {
      reset()
    }
  }, [editingCategory, setValue, reset])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('カテゴリの取得に失敗しました')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'カテゴリの保存に失敗しました')
      }

      toast.success(editingCategory ? 'カテゴリを更新しました' : 'カテゴリを作成しました')
      setDialogOpen(false)
      setEditingCategory(null)
      reset()
      fetchCategories()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'エラーが発生しました')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このカテゴリを削除してもよろしいですか？')) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'カテゴリの削除に失敗しました')
      }

      toast.success('カテゴリを削除しました')
      fetchCategories()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'エラーが発生しました')
    }
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingCategory(null)
      reset()
    }
  }

  return (
    <MainLayout>
      <PageHeader title="カテゴリ管理" description="商品カテゴリの管理" />

      <div className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>新規カテゴリ</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'カテゴリ編集' : '新規カテゴリ'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">カテゴリ名 *</Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'カテゴリ名は必須です' })}
                    placeholder="例: 電子機器"
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  <textarea
                    id="description"
                    {...register('description')}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="カテゴリの説明を入力"
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? '保存中...' : editingCategory ? '更新' : '作成'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
                    className="flex-1"
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
                <TableHead>カテゴリ名</TableHead>
                <TableHead>説明</TableHead>
                <TableHead className="text-right">商品数</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    カテゴリが登録されていません
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || '-'}</TableCell>
                    <TableCell className="text-right">{category._count.products}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                          編集
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          disabled={category._count.products > 0}
                        >
                          削除
                        </Button>
                      </div>
                    </TableCell>
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
