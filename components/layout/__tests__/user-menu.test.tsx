import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserMenu } from '../user-menu'
import * as nextAuth from 'next-auth/react'

// next-authをモック
const mockSignOut = jest.fn()
const mockUseSession = jest.fn()

jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signOut: (options: unknown) => mockSignOut(options),
}))

// lucide-reactアイコンをモック
jest.mock('lucide-react', () => ({
  LogOut: () => <div data-testid="logout-icon">Logout Icon</div>,
  User: () => <div data-testid="user-icon">User Icon</div>,
}))

describe('UserMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // デフォルトのセッション設定
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          role: 'USER',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    })
  })

  it('セッションがない場合は何も表示されない', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    })

    const { container } = render(<UserMenu />)
    expect(container.firstChild).toBeNull()
  })

  it('セッションがある場合はアバターが表示される', () => {
    render(<UserMenu />)
    expect(screen.getByText('TU')).toBeInTheDocument() // Test User のイニシャル
  })

  it('トリガーをクリックするとメニューが開く', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    const trigger = screen.getByRole('button')
    await user.click(trigger)

    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('ユーザー名が表示される', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('メールアドレスが表示される', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('プロフィールメニューアイテムが表示される', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByText('プロフィール')).toBeInTheDocument()
  })

  it('ログアウトメニューアイテムが表示される', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByText('ログアウト')).toBeInTheDocument()
  })

  it('ログアウトをクリックするとsignOutが呼ばれる', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('ログアウト'))

    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/login' })
  })

  it('名前がない場合はデフォルトのイニシャルが表示される', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          role: 'USER',
          name: null as unknown as string,
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(<UserMenu />)
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('複数の単語の名前からイニシャルが生成される', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          role: 'USER',
          name: 'John Doe Smith',
          email: 'john@example.com',
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    render(<UserMenu />)
    expect(screen.getByText('JDS')).toBeInTheDocument()
  })

  it('アイコンが表示される', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument()
  })
})
