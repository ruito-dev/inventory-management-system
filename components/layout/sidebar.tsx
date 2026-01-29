'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, FileText, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard },
  {
    name: '商品管理',
    icon: Package,
    children: [
      { name: '商品一覧', href: '/products' },
      { name: 'カテゴリ管理', href: '/categories' },
    ],
  },
  {
    name: '在庫管理',
    icon: ShoppingCart,
    children: [
      { name: '在庫一覧', href: '/stock' },
      { name: '在庫取引', href: '/stock-transactions' },
      { name: '在庫アラート', href: '/stock-alerts' },
    ],
  },
  {
    name: '発注管理',
    icon: FileText,
    children: [
      { name: '発注一覧', href: '/purchase-orders' },
      { name: '仕入先管理', href: '/suppliers' },
    ],
  },
  { name: 'レポート', href: '/reports', icon: BarChart3 },
  {
    name: '設定',
    icon: Settings,
    children: [
      { name: 'ユーザー管理', href: '/users' },
      { name: 'システム設定', href: '/settings' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-background min-h-screen">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-6">
          <Package className="h-6 w-6" />
          <span>在庫管理</span>
        </Link>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const hasChildren = 'children' in item

            if (hasChildren && 'children' in item) {
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </div>
                  <div className="ml-6 space-y-1">
                    {item.children?.map((child) => {
                      const isActive = pathname === child.href
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            'block px-3 py-2 rounded-md text-sm transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground font-medium'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          {child.name}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            }

            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
