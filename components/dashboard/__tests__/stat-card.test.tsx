import { render, screen } from '@testing-library/react'
import { StatCard } from '../stat-card'
import { Package, AlertTriangle, ShoppingCart, TrendingUp } from 'lucide-react'

describe('StatCard', () => {
  it('タイトルと値を表示する', () => {
    render(<StatCard title="総商品数" value="150" icon={Package} />)

    expect(screen.getByText('総商品数')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('説明文を表示する', () => {
    render(<StatCard title="総商品数" value="150" description="登録済み商品" icon={Package} />)

    expect(screen.getByText('登録済み商品')).toBeInTheDocument()
  })

  it('アイコンを表示する', () => {
    const { container } = render(<StatCard title="総商品数" value="150" icon={Package} />)

    // lucide-reactのアイコンはsvg要素として描画される
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('異なるアイコンで正しく表示される', () => {
    const { rerender, container } = render(
      <StatCard title="在庫切れ" value="5" icon={AlertTriangle} />
    )

    let svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()

    rerender(<StatCard title="発注数" value="10" icon={ShoppingCart} />)
    svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()

    rerender(<StatCard title="売上" value="¥1,000,000" icon={TrendingUp} />)
    svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('説明文がない場合でも正しく表示される', () => {
    render(<StatCard title="総商品数" value="150" icon={Package} />)

    expect(screen.getByText('総商品数')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('値が0の場合でも正しく表示される', () => {
    render(<StatCard title="在庫切れ" value="0" icon={AlertTriangle} />)

    expect(screen.getByText('在庫切れ')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('大きな数値でも正しく表示される', () => {
    render(<StatCard title="総売上" value="¥10,000,000" icon={TrendingUp} />)

    expect(screen.getByText('総売上')).toBeInTheDocument()
    expect(screen.getByText('¥10,000,000')).toBeInTheDocument()
  })
})
