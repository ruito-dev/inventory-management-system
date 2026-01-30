import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../page'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// モック
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}))

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

describe('LoginPage', () => {
  const mockPush = jest.fn()
  const mockSignIn = signIn as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  it('ログインフォームをレンダリングする', () => {
    render(<LoginPage />)

    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument()
    expect(screen.getByText('在庫管理システムにログインしてください')).toBeInTheDocument()
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument()
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
  })

  it('サインアップリンクをレンダリングする', () => {
    render(<LoginPage />)

    const signupLink = screen.getByText('新規登録')
    expect(signupLink).toBeInTheDocument()
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup')
  })

  it('正しい認証情報でログインできる', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: null, ok: true })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText('メールアドレス')
    const passwordInput = screen.getByLabelText('パスワード')
    const loginButton = screen.getByRole('button', { name: 'ログイン' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(loginButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('ログイン失敗時にエラーメッセージを表示する', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: 'Invalid credentials', ok: false })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText('メールアドレス')
    const passwordInput = screen.getByLabelText('パスワード')
    const loginButton = screen.getByRole('button', { name: 'ログイン' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(loginButton)

    await waitFor(() => {
      expect(
        screen.getByText('メールアドレスまたはパスワードが正しくありません')
      ).toBeInTheDocument()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('ログイン中はボタンが無効化される', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null, ok: true }), 100))
    )

    render(<LoginPage />)

    const emailInput = screen.getByLabelText('メールアドレス')
    const passwordInput = screen.getByLabelText('パスワード')
    const loginButton = screen.getByRole('button', { name: 'ログイン' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(loginButton)

    expect(screen.getByRole('button', { name: 'ログイン中...' })).toBeDisabled()

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('メールアドレスが空の場合はログインできない', async () => {
    const user = userEvent.setup()

    render(<LoginPage />)

    const passwordInput = screen.getByLabelText('パスワード')
    const loginButton = screen.getByRole('button', { name: 'ログイン' })

    await user.type(passwordInput, 'password123')
    await user.click(loginButton)

    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('パスワードが空の場合はログインできない', async () => {
    const user = userEvent.setup()

    render(<LoginPage />)

    const emailInput = screen.getByLabelText('メールアドレス')
    const loginButton = screen.getByRole('button', { name: 'ログイン' })

    await user.type(emailInput, 'test@example.com')
    await user.click(loginButton)

    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('エラーメッセージをクリアできる', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValueOnce({ error: 'Invalid credentials', ok: false })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText('メールアドレス')
    const passwordInput = screen.getByLabelText('パスワード')
    const loginButton = screen.getByRole('button', { name: 'ログイン' })

    // 最初のログイン試行（失敗）
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(loginButton)

    await waitFor(() => {
      expect(
        screen.getByText('メールアドレスまたはパスワードが正しくありません')
      ).toBeInTheDocument()
    })

    // 2回目のログイン試行（成功）
    mockSignIn.mockResolvedValueOnce({ error: null, ok: true })
    await user.clear(passwordInput)
    await user.type(passwordInput, 'correctpassword')
    await user.click(loginButton)

    await waitFor(() => {
      expect(
        screen.queryByText('メールアドレスまたはパスワードが正しくありません')
      ).not.toBeInTheDocument()
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('正しいレイアウトクラスを持つ', () => {
    const { container } = render(<LoginPage />)
    const mainDiv = container.firstChild
    expect(mainDiv).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center')
  })
})
