import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from '../alert'

describe('Alert Components', () => {
  describe('Alert', () => {
    it('アラートを表示する', () => {
      const { container } = render(<Alert>アラート内容</Alert>)

      expect(container.firstChild).toBeInTheDocument()
      expect(screen.getByText('アラート内容')).toBeInTheDocument()
    })

    it('デフォルトvariantで表示される', () => {
      const { container } = render(<Alert>デフォルト</Alert>)

      const alert = container.firstChild
      expect(alert).toHaveClass('bg-card')
    })

    it('destructivevariantで表示される', () => {
      const { container } = render(<Alert variant="destructive">エラー</Alert>)

      const alert = container.firstChild
      expect(alert).toHaveClass('text-destructive')
    })

    it('カスタムclassNameを適用できる', () => {
      const { container } = render(<Alert className="custom-alert">カスタム</Alert>)

      const alert = container.firstChild
      expect(alert).toHaveClass('custom-alert')
    })
  })

  describe('AlertTitle', () => {
    it('タイトルを表示する', () => {
      render(
        <Alert>
          <AlertTitle>アラートタイトル</AlertTitle>
        </Alert>
      )

      expect(screen.getByText('アラートタイトル')).toBeInTheDocument()
    })

    it('div要素として描画される', () => {
      render(
        <Alert>
          <AlertTitle>タイトル</AlertTitle>
        </Alert>
      )

      const title = screen.getByText('タイトル')
      expect(title.tagName).toBe('DIV')
    })

    it('カスタムclassNameを適用できる', () => {
      render(
        <Alert>
          <AlertTitle className="custom-title">タイトル</AlertTitle>
        </Alert>
      )

      const title = screen.getByText('タイトル')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('AlertDescription', () => {
    it('説明文を表示する', () => {
      render(
        <Alert>
          <AlertDescription>アラートの説明文</AlertDescription>
        </Alert>
      )

      expect(screen.getByText('アラートの説明文')).toBeInTheDocument()
    })

    it('div要素として描画される', () => {
      render(
        <Alert>
          <AlertDescription>説明</AlertDescription>
        </Alert>
      )

      const description = screen.getByText('説明')
      expect(description.tagName).toBe('DIV')
    })

    it('カスタムclassNameを適用できる', () => {
      render(
        <Alert>
          <AlertDescription className="custom-desc">説明</AlertDescription>
        </Alert>
      )

      const description = screen.getByText('説明')
      expect(description).toHaveClass('custom-desc')
    })
  })

  describe('Alert 統合', () => {
    it('タイトルと説明を組み合わせて表示できる', () => {
      render(
        <Alert>
          <AlertTitle>成功</AlertTitle>
          <AlertDescription>操作が正常に完了しました</AlertDescription>
        </Alert>
      )

      expect(screen.getByText('成功')).toBeInTheDocument()
      expect(screen.getByText('操作が正常に完了しました')).toBeInTheDocument()
    })

    it('destructivevariantでエラーメッセージを表示できる', () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>処理に失敗しました</AlertDescription>
        </Alert>
      )

      expect(screen.getByText('エラー')).toBeInTheDocument()
      expect(screen.getByText('処理に失敗しました')).toBeInTheDocument()
    })

    it('説明のみを表示できる', () => {
      render(
        <Alert>
          <AlertDescription>これは情報メッセージです</AlertDescription>
        </Alert>
      )

      expect(screen.getByText('これは情報メッセージです')).toBeInTheDocument()
    })

    it('タイトルのみを表示できる', () => {
      render(
        <Alert>
          <AlertTitle>通知</AlertTitle>
        </Alert>
      )

      expect(screen.getByText('通知')).toBeInTheDocument()
    })
  })
})
