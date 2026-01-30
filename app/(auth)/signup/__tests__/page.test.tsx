import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupPage from '../page'
import { useRouter } from 'next/navigation'

// モック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// グローバルfetchのモック
global.fetch = jest.fn()

describe('SignupPage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })
  })

  it('サインアップフォームをレンダリングする', () => {
    render(<SignupPage />)

    expect(screen.getByRole('heading', { name: '新規登録' })).toBeInTheDocument()
    expect(screen.getByText('アカウントを作成して在庫管理システムを利用開始')).toBeInTheDocument()
    expect(screen.getByLabelText('名前')).toBeInTheDocument()
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument()
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
    expect(screen.getByLabelText('パスワード（確認）')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument()
  })

  it('ログインリンクをレンダリングする', () => {
    render(<SignupPage />)

    const loginLink = screen.getByText('ログイン')
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login')
  })

  it('正しい情報でサインアップできる', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1' }),
    })

    render(<SignupPage />)

    const nameInput = screen.getByLabelText('名前')
    const emailInput = screen.getByLabelText('メールアドレス')
    const passwordInput = screen.getByLabelText('パスワード')
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）')
    const signupButton = screen.getByRole('button', { name: '登録' })

    await user.type(nameInput, 'Test User')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(signupButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      })
      expect(mockPush).toHaveBeenCalledWith('/login?registered=true')
    })
  })

  it('パスワードが一致しない場合にエラーメッセージを表示する', async () => {
    const user = userEvent.setup()

    render(<SignupPage />)

    const nameInput = screen.getByLabelText('名前')
    const emailInput = screen.getByLabelText('メールアドレス')
    const passwordInput = screen.getByLabelText('パスワード')
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）')
    const signupButton = screen.getByRole('button', { name: '登録' })

    await user.type(nameInput, 'Test User')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'differentpassword')
    await user.click(signupButton)

    await waitFor(() => {
      expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument()
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('サインアップ失敗時にエラーメッセージを表示する', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'このメールアドレスは既に登録されています' }),
    })

    render(<SignupPage />)

    const nameInput = screen.getByLabelText('名前')
    const emailInput = screen.getByLabelText('メールアドレス')
    const passwordInput = screen.getByLabelText('パスワード')
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）')
    const signupButton = screen.getByRole('button', { name: '登録' })

    await user.type(nameInput, 'Test User')
    await user.type(emailInput, 'existing@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(signupButton)

    await waitFor(() => {
      expect(screen.getByText('このメールアドレスは既に登録されています')).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('登録中はボタンが無効化される', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100)
        )
    )

    render(<SignupPage />)

    const nameInput = screen.getByLabelText('名前')
    const emailInput = screen.getByLabelText('メールアドレス')
    const passwordInput = screen.getByLabelText('パスワード')
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）')
    const signupButton = screen.getByRole('button', { name: '登録' })

    await user.type(nameInput, 'Test User')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(signupButton)

    expect(screen.getByRole('button', { name: '登録中...' })).toBeDisabled()

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?registered=true')
    })
  })

  it('名前が空の場合はサインアップできない', async () => {
    const user = userEvent.setup()

    render(<SignupPage />)

    const emailInput = screen.getByLabelText('メールアドレス')
    const passwordInput = screen.getByLabelText('パスワード')
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）')
    const signupButton = screen.getByRole('button', { name: '登録' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(signupButton)

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('メールアドレスが空の場合はサインアップできない', async () => {
    const user = userEvent.setup()

    render(<SignupPage />)

    const nameInput = screen.getByLabelText('名前')
    const passwordInput = screen.getByLabelText('パスワード')
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）')
    const signupButton = screen.getByRole('button', { name: '登録' })

    await user.type(nameInput, 'Test User')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(signupButton)

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('パスワードが空の場合はサインアップできない', async () => {
    const user = userEvent.setup()

    render(<SignupPage />)

    const nameInput = screen.getByLabelText('名前')
    const emailInput = screen.getByLabelText('メールアドレス')
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）')
    const signupButton = screen.getByRole('button', { name: '登録' })

    await user.type(nameInput, 'Test User')
    await user.type(emailInput, 'test@example.com')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(signupButton)

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('確認パスワードが空の場合はサインアップできない', async () => {
    const user = userEvent.setup()

    render(<SignupPage />)

    const nameInput = screen.getByLabelText('名前')
    const emailInput = screen.getByLabelText('メールアドレス')
    const passwordInput = screen.getByLabelText('パスワード')
    const signupButton = screen.getByRole('button', { name: '登録' })

    await user.type(nameInput, 'Test User')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(signupButton)

    // 確認パスワードが空の場合、フォームは送信されない
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('正しいレイアウトクラスを持つ', () => {
    const { container } = render(<SignupPage />)
    const mainDiv = container.firstChild
    expect(mainDiv).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center')
  })
})
