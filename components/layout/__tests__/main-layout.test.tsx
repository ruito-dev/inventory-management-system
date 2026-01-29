import { render, screen } from '@testing-library/react'
import { MainLayout } from '../main-layout'

// Mock child components
jest.mock('../sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}))

jest.mock('../navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}))

describe('MainLayout', () => {
  it('子要素を表示する', () => {
    render(
      <MainLayout>
        <div>メインコンテンツ</div>
      </MainLayout>
    )

    expect(screen.getByText('メインコンテンツ')).toBeInTheDocument()
  })

  it('Sidebarを表示する', () => {
    render(
      <MainLayout>
        <div>コンテンツ</div>
      </MainLayout>
    )

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('Navbarを表示する', () => {
    render(
      <MainLayout>
        <div>コンテンツ</div>
      </MainLayout>
    )

    expect(screen.getByTestId('navbar')).toBeInTheDocument()
  })

  it('複数の子要素を表示できる', () => {
    render(
      <MainLayout>
        <div>コンテンツ1</div>
        <div>コンテンツ2</div>
        <div>コンテンツ3</div>
      </MainLayout>
    )

    expect(screen.getByText('コンテンツ1')).toBeInTheDocument()
    expect(screen.getByText('コンテンツ2')).toBeInTheDocument()
    expect(screen.getByText('コンテンツ3')).toBeInTheDocument()
  })

  it('レイアウト構造が正しい', () => {
    const { container } = render(
      <MainLayout>
        <div>コンテンツ</div>
      </MainLayout>
    )

    // Sidebarとメインコンテンツエリアが存在することを確認
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(container.querySelector('main')).toBeInTheDocument()
  })
})
