import { render, screen } from '@testing-library/react'
import { Badge } from '../badge'

describe('Badge', () => {
  it('テキストを表示する', () => {
    render(<Badge>テストバッジ</Badge>)

    expect(screen.getByText('テストバッジ')).toBeInTheDocument()
  })

  it('デフォルトvariantで表示される', () => {
    const { container } = render(<Badge>デフォルト</Badge>)

    const badge = container.firstChild
    expect(badge).toHaveClass('bg-primary')
  })

  it('secondaryvariantで表示される', () => {
    const { container } = render(<Badge variant="secondary">セカンダリ</Badge>)

    const badge = container.firstChild
    expect(badge).toHaveClass('bg-secondary')
  })

  it('destructivevariantで表示される', () => {
    const { container } = render(<Badge variant="destructive">警告</Badge>)

    const badge = container.firstChild
    expect(badge).toHaveClass('bg-destructive')
  })

  it('outlinevariantで表示される', () => {
    const { container } = render(<Badge variant="outline">アウトライン</Badge>)

    const badge = container.firstChild
    expect(badge).toHaveClass('border-border')
  })

  it('カスタムclassNameを適用できる', () => {
    const { container } = render(<Badge className="custom-class">カスタム</Badge>)

    const badge = container.firstChild
    expect(badge).toHaveClass('custom-class')
  })

  it('子要素として複数の要素を含められる', () => {
    render(
      <Badge>
        <span>アイコン</span>
        <span>テキスト</span>
      </Badge>
    )

    expect(screen.getByText('アイコン')).toBeInTheDocument()
    expect(screen.getByText('テキスト')).toBeInTheDocument()
  })

  it('数値を表示できる', () => {
    render(<Badge>42</Badge>)

    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('空のバッジを表示できる', () => {
    const { container } = render(<Badge />)

    expect(container.firstChild).toBeInTheDocument()
  })
})
