import React from 'react'
import { render, screen } from '@testing-library/react'
import { Navbar } from '../navbar'
import * as nextNavigation from 'next/navigation'

// next/linkをモック
jest.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ children, href }: { children: React.ReactNode; href: string }) => {
      return <a href={href}>{children}</a>
    },
  }
})

// next/navigationをモック
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/dashboard'),
}))

// UserMenuをモック
jest.mock('../user-menu', () => ({
  UserMenu: () => <div data-testid="user-menu">User Menu</div>,
}))

// lucide-reactアイコンをモック
jest.mock('lucide-react', () => ({
  Package: () => <div data-testid="package-icon">Package</div>,
  BarChart3: () => <div data-testid="chart-icon">Chart</div>,
  ShoppingCart: () => <div data-testid="cart-icon">Cart</div>,
  FileText: () => <div data-testid="file-icon">File</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
}))

describe('Navbar', () => {
  it('ナビゲーションバーがレンダリングされる', () => {
    render(<Navbar />)
    expect(screen.getByText('在庫管理システム')).toBeInTheDocument()
  })

  it('ロゴリンクが表示される', () => {
    render(<Navbar />)
    const logoLink = screen.getByText('在庫管理システム').closest('a')
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('ダッシュボードリンクが表示される', () => {
    render(<Navbar />)
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument()
  })

  it('商品管理リンクが表示される', () => {
    render(<Navbar />)
    expect(screen.getByText('商品管理')).toBeInTheDocument()
  })

  it('在庫管理リンクが表示される', () => {
    render(<Navbar />)
    expect(screen.getByText('在庫管理')).toBeInTheDocument()
  })

  it('発注管理リンクが表示される', () => {
    render(<Navbar />)
    expect(screen.getByText('発注管理')).toBeInTheDocument()
  })

  it('レポートリンクが表示される', () => {
    render(<Navbar />)
    expect(screen.getByText('レポート')).toBeInTheDocument()
  })

  it('設定リンクが表示される', () => {
    render(<Navbar />)
    expect(screen.getByText('設定')).toBeInTheDocument()
  })

  it('UserMenuが表示される', () => {
    render(<Navbar />)
    expect(screen.getByTestId('user-menu')).toBeInTheDocument()
  })

  it('すべてのナビゲーションリンクが正しいhrefを持つ', () => {
    render(<Navbar />)

    const dashboardLink = screen.getByText('ダッシュボード').closest('a')
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')

    const productsLink = screen.getByText('商品管理').closest('a')
    expect(productsLink).toHaveAttribute('href', '/products')

    const stockLink = screen.getByText('在庫管理').closest('a')
    expect(stockLink).toHaveAttribute('href', '/stock')

    const ordersLink = screen.getByText('発注管理').closest('a')
    expect(ordersLink).toHaveAttribute('href', '/purchase-orders')

    const reportsLink = screen.getByText('レポート').closest('a')
    expect(reportsLink).toHaveAttribute('href', '/reports')

    const settingsLink = screen.getByText('設定').closest('a')
    expect(settingsLink).toHaveAttribute('href', '/settings')
  })

  it('アイコンが表示される', () => {
    render(<Navbar />)
    // ロゴとナビゲーションアイテムでPackageアイコンが2つ表示される
    expect(screen.getAllByTestId('package-icon').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByTestId('chart-icon')).toBeInTheDocument()
    expect(screen.getByTestId('cart-icon')).toBeInTheDocument()
    expect(screen.getAllByTestId('file-icon').length).toBeGreaterThanOrEqual(2) // 発注管理とレポート
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
  })
})
