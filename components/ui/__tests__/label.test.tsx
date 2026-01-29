import { render, screen } from '@testing-library/react'
import { Label } from '../label'

describe('Label', () => {
  it('ラベルテキストを表示する', () => {
    render(<Label>ユーザー名</Label>)

    expect(screen.getByText('ユーザー名')).toBeInTheDocument()
  })

  it('htmlFor属性を設定できる', () => {
    render(<Label htmlFor="username">ユーザー名</Label>)

    const label = screen.getByText('ユーザー名')
    expect(label).toHaveAttribute('for', 'username')
  })

  it('カスタムclassNameを適用できる', () => {
    render(<Label className="custom-label">ラベル</Label>)

    const label = screen.getByText('ラベル')
    expect(label).toHaveClass('custom-label')
  })

  it('子要素として複数の要素を含められる', () => {
    render(
      <Label>
        <span>必須</span>
        <span>ユーザー名</span>
      </Label>
    )

    expect(screen.getByText('必須')).toBeInTheDocument()
    expect(screen.getByText('ユーザー名')).toBeInTheDocument()
  })

  it('label要素として描画される', () => {
    render(<Label>テストラベル</Label>)

    const label = screen.getByText('テストラベル')
    expect(label.tagName).toBe('LABEL')
  })
})
