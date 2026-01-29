import { MainLayout, PageHeader } from '@/components/layout'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, AlertTriangle, ShoppingCart, TrendingUp } from 'lucide-react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface Product {
  id: string
  name: string
  sku: string
  currentStock: number
  minStockLevel: number
  category: {
    name: string
  }
}

interface Transaction {
  id: string
  type: 'IN' | 'OUT'
  quantity: number
  product: {
    name: string
  }
  user: {
    name: string
  }
}

async function getDashboardStats() {
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/dashboard/stats`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const data = await getDashboardStats()

  return (
    <MainLayout>
      <PageHeader title="ダッシュボード" description="システムの概要と最新情報" />

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="総商品数"
          value={data?.stats.totalProducts || 0}
          description="登録されている商品"
          icon={Package}
        />
        <StatCard
          title="在庫切れ"
          value={data?.stats.outOfStockProducts || 0}
          description="在庫がない商品"
          icon={AlertTriangle}
        />
        <StatCard
          title="発注中"
          value={data?.stats.pendingOrders || 0}
          description="処理中の発注"
          icon={ShoppingCart}
        />
        <StatCard
          title="今月の取引"
          value={data?.stats.monthlyTransactions || 0}
          description="入出庫の合計"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* 在庫アラート */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>在庫アラート</CardTitle>
            <CardDescription>最小在庫レベル以下の商品</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {data.lowStockProducts.map((product: Product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.category.name} • SKU: {product.sku}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">在庫: {product.currentStock}</Badge>
                      <span className="text-sm text-muted-foreground">
                        / {product.minStockLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">在庫アラートはありません</p>
            )}
          </CardContent>
        </Card>

        {/* 最近の在庫取引 */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>最近の在庫取引</CardTitle>
            <CardDescription>直近10件の入出庫履歴</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentTransactions && data.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {data.recentTransactions.map((transaction: Transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{transaction.product.name}</p>
                      <p className="text-sm text-muted-foreground">{transaction.user.name}</p>
                    </div>
                    <Badge variant={transaction.type === 'IN' ? 'default' : 'secondary'}>
                      {transaction.type === 'IN' ? '入庫' : '出庫'} {transaction.quantity}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">取引履歴がありません</p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
