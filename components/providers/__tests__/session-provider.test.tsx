import { render, screen } from '@testing-library/react'
import { SessionProvider } from '../session-provider'

// Mock next-auth SessionProvider
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}))

describe('SessionProvider', () => {
  it('子要素を表示する', () => {
    render(
      <SessionProvider>
        <div>アプリケーション</div>
      </SessionProvider>
    )

    expect(screen.getByText('アプリケーション')).toBeInTheDocument()
  })

  it('SessionProviderでラップされる', () => {
    render(
      <SessionProvider>
        <div>コンテンツ</div>
      </SessionProvider>
    )

    expect(screen.getByTestId('session-provider')).toBeInTheDocument()
  })

  it('複数の子要素を表示できる', () => {
    render(
      <SessionProvider>
        <div>ヘッダー</div>
        <div>メイン</div>
        <div>フッター</div>
      </SessionProvider>
    )

    expect(screen.getByText('ヘッダー')).toBeInTheDocument()
    expect(screen.getByText('メイン')).toBeInTheDocument()
    expect(screen.getByText('フッター')).toBeInTheDocument()
  })
})
