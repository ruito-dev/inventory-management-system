'use client'

import { useState, useEffect } from 'react'
import { MainLayout, PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface CategoryStat {
  name: string
  totalStock: number
  productCount: number
  lowStockCount: number
}

interface SupplierStat {
  name: string
  orderCount: number
  totalAmount: number
}

interface MonthlyStat {
  month: string
  in: number
  out: number
}

interface Statistics {
  categoryStats: CategoryStat[]
  transactionStats: {
    totalIn: number
    totalOut: number
    byType: {
      IN: number
      OUT: number
    }
  }
  supplierOrderStats: SupplierStat[]
  monthlyStats: MonthlyStat[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function ReportsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/reports/statistics?${params}`)
      if (!response.ok) {
        throw new Error('統計の取得に失敗しました')
      }
      const data = await response.json()
      setStatistics(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '統計の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async (type: 'products' | 'transactions' | 'orders') => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      let endpoint = ''
      let filename = ''

      switch (type) {
        case 'products':
          endpoint = '/api/products'
          filename = 'products.csv'
          break
        case 'transactions':
          endpoint = '/api/stock-transactions'
          filename = 'stock-transactions.csv'
          break
        case 'orders':
          endpoint = '/api/purchase-orders'
          filename = 'purchase-orders.csv'
          break
      }

      const response = await fetch(`${endpoint}?${params}&limit=10000`)
      if (!response.ok) {
        throw new Error('データの取得に失敗しました')
      }

      const data = await response.json()
      const csv = convertToCSV(data, type)
      downloadCSV(csv, filename)
      toast.success('CSVファイルをダウンロードしました')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'CSVのエクスポートに失敗しました')
    }
  }

  const convertToCSV = (data: any, type: string): string => {
    const BOM = '\uFEFF'
    let csv = BOM

    if (type === 'products') {
      csv += '商品名,SKU,カテゴリー,価格,現在庫,最小在庫レベル\n'
      data.products?.forEach((item: any) => {
        csv += `"${item.name}","${item.sku}","${item.category.name}",${item.price},${item.currentStock},${item.minStockLevel}\n`
      })
    } else if (type === 'transactions') {
      csv += '日時,取引タイプ,商品名,SKU,数量,理由\n'
      data.transactions?.forEach((item: any) => {
        csv += `"${item.createdAt}","${item.type}","${item.product.name}","${item.product.sku}",${item.quantity},"${item.reason}"\n`
      })
    } else if (type === 'orders') {
      csv += '発注日,仕入先,ステータス,納期,合計金額\n'
      data.orders?.forEach((item: any) => {
        csv += `"${item.orderDate}","${item.supplier.name}","${item.status}","${item.expectedDate || ''}",${item.totalAmount}\n`
      })
    }

    return csv
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
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

  return (
    <MainLayout>
      <PageHeader
        title="レポート"
        description="統計情報とデータのエクスポート"
      />

      <div className="space-y-6">
        {/* 期間選択 */}
        <Card>
          <CardHeader>
            <CardTitle>期間選択</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="startDate">開始日</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="endDate">終了日</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button onClick={fetchStatistics}>更新</Button>
            </div>
          </CardContent>
        </Card>

        {/* CSV出力 */}
        <Card>
          <CardHeader>
            <CardTitle>データエクスポート</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={() => handleExportCSV('products')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                商品一覧CSV
              </Button>
              <Button onClick={() => handleExportCSV('transactions')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                在庫取引CSV
              </Button>
              <Button onClick={() => handleExportCSV('orders')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                発注一覧CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 統計グラフ */}
        {statistics && (
          <Tabs defaultValue="category" className="space-y-4">
            <TabsList>
              <TabsTrigger value="category">カテゴリ別在庫</TabsTrigger>
              <TabsTrigger value="monthly">月別推移</TabsTrigger>
              <TabsTrigger value="supplier">仕入先別発注</TabsTrigger>
            </TabsList>

            <TabsContent value="category">
              <Card>
                <CardHeader>
                  <CardTitle>カテゴリ別在庫状況</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={statistics.categoryStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalStock" fill="#8884d8" name="総在庫数" />
                      <Bar dataKey="productCount" fill="#82ca9d" name="商品数" />
                      <Bar dataKey="lowStockCount" fill="#ffc658" name="在庫少商品数" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monthly">
              <Card>
                <CardHeader>
                  <CardTitle>月別在庫取引推移</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={statistics.monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="in" stroke="#82ca9d" name="入庫" />
                      <Line type="monotone" dataKey="out" stroke="#ff7c7c" name="出庫" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="supplier">
              <Card>
                <CardHeader>
                  <CardTitle>仕入先別発注統計</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={statistics.supplierOrderStats}
                          dataKey="orderCount"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          label
                        >
                          {statistics.supplierOrderStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={statistics.supplierOrderStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalAmount" fill="#8884d8" name="発注金額" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  )
}
