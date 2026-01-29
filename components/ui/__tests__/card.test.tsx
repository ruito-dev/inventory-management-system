import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('子要素を表示する', () => {
      render(<Card>カード内容</Card>)

      expect(screen.getByText('カード内容')).toBeInTheDocument()
    })

    it('カスタムclassNameを適用できる', () => {
      const { container } = render(<Card className="custom-card">内容</Card>)

      const card = container.firstChild
      expect(card).toHaveClass('custom-card')
    })
  })

  describe('CardHeader', () => {
    it('ヘッダー内容を表示する', () => {
      render(<CardHeader>ヘッダー</CardHeader>)

      expect(screen.getByText('ヘッダー')).toBeInTheDocument()
    })

    it('カスタムclassNameを適用できる', () => {
      const { container } = render(<CardHeader className="custom-header">ヘッダー</CardHeader>)

      const header = container.firstChild
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('タイトルを表示する', () => {
      render(<CardTitle>カードタイトル</CardTitle>)

      expect(screen.getByText('カードタイトル')).toBeInTheDocument()
    })

    it('div要素として描画される', () => {
      render(<CardTitle>タイトル</CardTitle>)

      const title = screen.getByText('タイトル')
      expect(title.tagName).toBe('DIV')
    })
  })

  describe('CardDescription', () => {
    it('説明文を表示する', () => {
      render(<CardDescription>カードの説明文</CardDescription>)

      expect(screen.getByText('カードの説明文')).toBeInTheDocument()
    })

    it('div要素として描画される', () => {
      render(<CardDescription>説明</CardDescription>)

      const description = screen.getByText('説明')
      expect(description.tagName).toBe('DIV')
    })
  })

  describe('CardContent', () => {
    it('コンテンツを表示する', () => {
      render(<CardContent>カードコンテンツ</CardContent>)

      expect(screen.getByText('カードコンテンツ')).toBeInTheDocument()
    })

    it('複数の子要素を含められる', () => {
      render(
        <CardContent>
          <p>段落1</p>
          <p>段落2</p>
        </CardContent>
      )

      expect(screen.getByText('段落1')).toBeInTheDocument()
      expect(screen.getByText('段落2')).toBeInTheDocument()
    })
  })

  describe('CardFooter', () => {
    it('フッター内容を表示する', () => {
      render(<CardFooter>フッター</CardFooter>)

      expect(screen.getByText('フッター')).toBeInTheDocument()
    })

    it('カスタムclassNameを適用できる', () => {
      const { container } = render(<CardFooter className="custom-footer">フッター</CardFooter>)

      const footer = container.firstChild
      expect(footer).toHaveClass('custom-footer')
    })
  })

  describe('Card 統合', () => {
    it('すべてのコンポーネントを組み合わせて表示できる', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>商品情報</CardTitle>
            <CardDescription>商品の詳細情報を表示します</CardDescription>
          </CardHeader>
          <CardContent>
            <p>商品名: テスト商品</p>
            <p>価格: ¥1,000</p>
          </CardContent>
          <CardFooter>
            <button>購入する</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByText('商品情報')).toBeInTheDocument()
      expect(screen.getByText('商品の詳細情報を表示します')).toBeInTheDocument()
      expect(screen.getByText('商品名: テスト商品')).toBeInTheDocument()
      expect(screen.getByText('価格: ¥1,000')).toBeInTheDocument()
      expect(screen.getByText('購入する')).toBeInTheDocument()
    })
  })
})
