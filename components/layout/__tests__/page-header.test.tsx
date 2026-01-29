import { render, screen } from '@testing-library/react'
import { PageHeader } from '../page-header'

describe('PageHeader', () => {
  it('タイトルを表示する', () => {
    render(<PageHeader title="商品管理" />)

    expect(screen.getByText('商品管理')).toBeInTheDocument()
  })

  it('説明文を表示する', () => {
    render(<PageHeader title="商品管理" description="商品の登録・編集・削除ができます" />)

    expect(screen.getByText('商品管理')).toBeInTheDocument()
    expect(screen.getByText('商品の登録・編集・削除ができます')).toBeInTheDocument()
  })

  it('説明文がない場合でも正しく表示される', () => {
    render(<PageHeader title="ダッシュボード" />)

    expect(screen.getByText('ダッシュボード')).toBeInTheDocument()
  })

  it('タイトルがh1要素として描画される', () => {
    render(<PageHeader title="在庫管理" />)

    const title = screen.getByText('在庫管理')
    expect(title.tagName).toBe('H1')
  })

  it('説明文がp要素として描画される', () => {
    render(<PageHeader title="レポート" description="各種レポートを表示します" />)

    const description = screen.getByText('各種レポートを表示します')
    expect(description.tagName).toBe('P')
  })

  it('長いタイトルでも正しく表示される', () => {
    render(<PageHeader title="在庫管理システム - 商品一覧・在庫状況確認" />)

    expect(screen.getByText('在庫管理システム - 商品一覧・在庫状況確認')).toBeInTheDocument()
  })

  it('長い説明文でも正しく表示される', () => {
    render(
      <PageHeader
        title="設定"
        description="システムの各種設定を変更できます。プロフィール情報、パスワード、通知設定などを管理します。"
      />
    )

    expect(
      screen.getByText(
        'システムの各種設定を変更できます。プロフィール情報、パスワード、通知設定などを管理します。'
      )
    ).toBeInTheDocument()
  })
})
