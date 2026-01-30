import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CategoriesPage from '../page'
import { toast } from 'sonner'

// モック
jest.mock('@/components/layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PageHeader: ({ title, description }: { title: string; description: string }) => (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// グローバルfetchのモック
global.fetch = jest.fn()
global.confirm = jest.fn()

describe('CategoriesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    })
  })

  it('ページヘッダーをレンダリングする', async () => {
    render(<CategoriesPage />)

    await waitFor(() => {
      expect(screen.getByText('カテゴリ管理')).toBeInTheDocument()
      expect(screen.getByText('商品カテゴリの管理')).toBeInTheDocument()
    })
  })

  it('新規カテゴリボタンをレンダリングする', async () => {
    render(<CategoriesPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '新規カテゴリ' })).toBeInTheDocument()
    })
  })

  it('初期ロード時にカテゴリを取得する', async () => {
    const mockCategories = [
      {
        id: '1',
        name: 'テストカテゴリ',
        description: 'テスト説明',
        _count: { products: 5 },
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    })

    render(<CategoriesPage />)

    await waitFor(() => {
      expect(screen.getByText('テストカテゴリ')).toBeInTheDocument()
      expect(screen.getByText('テスト説明')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/categories')
  })

  it('カテゴリが空の場合にメッセージを表示する', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    render(<CategoriesPage />)

    await waitFor(() => {
      expect(screen.getByText('カテゴリが登録されていません')).toBeInTheDocument()
    })
  })

  it('ローディング中にメッセージを表示する', () => {
    ;(global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // 永遠に解決しないPromise
    )

    render(<CategoriesPage />)

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('カテゴリ取得エラー時にトーストを表示する', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'エラー' }),
    })

    render(<CategoriesPage />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('カテゴリの取得に失敗しました')
    })
  })

  it('新規カテゴリダイアログを開く', async () => {
    const user = userEvent.setup()
    render(<CategoriesPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '新規カテゴリ' })).toBeInTheDocument()
    })

    const newButton = screen.getByRole('button', { name: '新規カテゴリ' })
    await user.click(newButton)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '新規カテゴリ' })).toBeInTheDocument()
      expect(screen.getByLabelText('カテゴリ名 *')).toBeInTheDocument()
      expect(screen.getByLabelText('説明')).toBeInTheDocument()
    })
  })

  it('新規カテゴリを作成する', async () => {
    const user = userEvent.setup()
    const mockCategories = [
      {
        id: '1',
        name: '新しいカテゴリ',
        description: '新しい説明',
        _count: { products: 0 },
      },
    ]

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      })

    render(<CategoriesPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '新規カテゴリ' })).toBeInTheDocument()
    })

    const newButton = screen.getByRole('button', { name: '新規カテゴリ' })
    await user.click(newButton)

    await waitFor(() => {
      expect(screen.getByLabelText('カテゴリ名 *')).toBeInTheDocument()
    })

    const nameInput = screen.getByLabelText('カテゴリ名 *')
    const descriptionInput = screen.getByLabelText('説明')

    await user.type(nameInput, '新しいカテゴリ')
    await user.type(descriptionInput, '新しい説明')

    const submitButton = screen.getByRole('button', { name: '作成' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('カテゴリを作成しました')
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '新しいカテゴリ',
        description: '新しい説明',
      }),
    })
  })

  it('カテゴリ名が空の場合にバリデーションエラーを表示する', async () => {
    const user = userEvent.setup()
    render(<CategoriesPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '新規カテゴリ' })).toBeInTheDocument()
    })

    const newButton = screen.getByRole('button', { name: '新規カテゴリ' })
    await user.click(newButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '作成' })).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: '作成' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('カテゴリ名は必須です')).toBeInTheDocument()
    })
  })

  it('編集ボタンをクリックしてカテゴリを編集する', async () => {
    const user = userEvent.setup()
    const mockCategories = [
      {
        id: '1',
        name: 'テストカテゴリ',
        description: 'テスト説明',
        _count: { products: 5 },
      },
    ]

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      })

    render(<CategoriesPage />)

    await waitFor(() => {
      expect(screen.getByText('テストカテゴリ')).toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: '編集' })
    await user.click(editButton)

    await waitFor(() => {
      expect(screen.getByText('カテゴリ編集')).toBeInTheDocument()
      expect(screen.getByDisplayValue('テストカテゴリ')).toBeInTheDocument()
      expect(screen.getByDisplayValue('テスト説明')).toBeInTheDocument()
    })

    const nameInput = screen.getByLabelText('カテゴリ名 *')
    await user.clear(nameInput)
    await user.type(nameInput, '更新されたカテゴリ')

    const submitButton = screen.getByRole('button', { name: '更新' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('カテゴリを更新しました')
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/categories/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '更新されたカテゴリ',
        description: 'テスト説明',
      }),
    })
  })

  it('削除ボタンをクリックしてカテゴリを削除する', async () => {
    const user = userEvent.setup()
    const mockCategories = [
      {
        id: '1',
        name: 'テストカテゴリ',
        description: 'テスト説明',
        _count: { products: 0 },
      },
    ]

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
    ;(global.confirm as jest.Mock).mockReturnValue(true)

    render(<CategoriesPage />)

    await waitFor(() => {
      expect(screen.getByText('テストカテゴリ')).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole('button', { name: '削除' })
    await user.click(deleteButton)

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledWith('このカテゴリを削除してもよろしいですか？')
      expect(toast.success).toHaveBeenCalledWith('カテゴリを削除しました')
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/categories/1', {
      method: 'DELETE',
    })
  })

  it('商品が紐づいているカテゴリの削除ボタンは無効化される', async () => {
    const mockCategories = [
      {
        id: '1',
        name: 'テストカテゴリ',
        description: 'テスト説明',
        _count: { products: 5 },
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    })

    render(<CategoriesPage />)

    await waitFor(() => {
      expect(screen.getByText('テストカテゴリ')).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole('button', { name: '削除' })
    expect(deleteButton).toBeDisabled()
  })

  it('削除確認でキャンセルした場合は削除しない', async () => {
    const user = userEvent.setup()
    const mockCategories = [
      {
        id: '1',
        name: 'テストカテゴリ',
        description: 'テスト説明',
        _count: { products: 0 },
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories,
    })
    ;(global.confirm as jest.Mock).mockReturnValue(false)

    render(<CategoriesPage />)

    await waitFor(() => {
      expect(screen.getByText('テストカテゴリ')).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole('button', { name: '削除' })
    await user.click(deleteButton)

    expect(global.confirm).toHaveBeenCalled()
    expect(global.fetch).toHaveBeenCalledTimes(1) // 初期ロードのみ
  })

  it('キャンセルボタンでダイアログを閉じる', async () => {
    const user = userEvent.setup()
    render(<CategoriesPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '新規カテゴリ' })).toBeInTheDocument()
    })

    const newButton = screen.getByRole('button', { name: '新規カテゴリ' })
    await user.click(newButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
    })

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: '新規カテゴリ' })).not.toBeInTheDocument()
    })
  })
})
