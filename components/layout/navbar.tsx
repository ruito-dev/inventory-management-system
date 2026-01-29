"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, BarChart3, ShoppingCart, FileText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserMenu } from "./user-menu"

const navigation = [
  { name: "ダッシュボード", href: "/dashboard", icon: BarChart3 },
  { name: "商品管理", href: "/products", icon: Package },
  { name: "在庫管理", href: "/stock", icon: ShoppingCart },
  { name: "発注管理", href: "/purchase-orders", icon: FileText },
  { name: "レポート", href: "/reports", icon: FileText },
  { name: "設定", href: "/settings", icon: Settings },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Package className="h-6 w-6" />
              <span>在庫管理システム</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  )
}
