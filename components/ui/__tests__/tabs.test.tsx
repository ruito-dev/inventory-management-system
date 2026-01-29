import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs'

describe('Tabs Components', () => {
  describe('Tabs', () => {
    it('タブを表示する', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
        </Tabs>
      )

      expect(screen.getByText('タブ1')).toBeInTheDocument()
      expect(screen.getByText('コンテンツ1')).toBeInTheDocument()
    })

    it('デフォルト値のタブが選択される', () => {
      render(
        <Tabs defaultValue="tab2">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
          <TabsContent value="tab2">コンテンツ2</TabsContent>
        </Tabs>
      )

      expect(screen.getByText('コンテンツ2')).toBeInTheDocument()
    })
  })

  describe('TabsList', () => {
    it('タブリストを表示する', () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
          </TabsList>
        </Tabs>
      )

      const tablist = container.querySelector('[role="tablist"]')
      expect(tablist).toBeInTheDocument()
    })

    it('カスタムclassNameを適用できる', () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-tablist">
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
          </TabsList>
        </Tabs>
      )

      const tablist = container.querySelector('[role="tablist"]')
      expect(tablist).toHaveClass('custom-tablist')
    })
  })

  describe('TabsTrigger', () => {
    it('タブトリガーを表示する', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
          </TabsList>
        </Tabs>
      )

      const trigger = screen.getByText('タブ1')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute('role', 'tab')
    })

    it('タブをクリックして切り替えられる', async () => {
      const user = userEvent.setup()

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
          <TabsContent value="tab2">コンテンツ2</TabsContent>
        </Tabs>
      )

      expect(screen.getByText('コンテンツ1')).toBeInTheDocument()

      await user.click(screen.getByText('タブ2'))

      expect(screen.getByText('コンテンツ2')).toBeInTheDocument()
    })

    it('カスタムclassNameを適用できる', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" className="custom-trigger">
              タブ1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )

      const trigger = screen.getByText('タブ1')
      expect(trigger).toHaveClass('custom-trigger')
    })
  })

  describe('TabsContent', () => {
    it('タブコンテンツを表示する', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
        </Tabs>
      )

      expect(screen.getByText('コンテンツ1')).toBeInTheDocument()
    })

    it('選択されていないタブのコンテンツは表示されない', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
          <TabsContent value="tab2">コンテンツ2</TabsContent>
        </Tabs>
      )

      expect(screen.getByText('コンテンツ1')).toBeInTheDocument()
      expect(screen.queryByText('コンテンツ2')).not.toBeInTheDocument()
    })

    it('カスタムclassNameを適用できる', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-content">
            コンテンツ1
          </TabsContent>
        </Tabs>
      )

      const content = screen.getByText('コンテンツ1')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('Tabs 統合', () => {
    it('複数のタブを切り替えられる', async () => {
      const user = userEvent.setup()

      render(
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">プロフィール</TabsTrigger>
            <TabsTrigger value="settings">設定</TabsTrigger>
            <TabsTrigger value="notifications">通知</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">プロフィール情報</TabsContent>
          <TabsContent value="settings">設定画面</TabsContent>
          <TabsContent value="notifications">通知一覧</TabsContent>
        </Tabs>
      )

      expect(screen.getByText('プロフィール情報')).toBeInTheDocument()

      await user.click(screen.getByText('設定'))
      expect(screen.getByText('設定画面')).toBeInTheDocument()
      expect(screen.queryByText('プロフィール情報')).not.toBeInTheDocument()

      await user.click(screen.getByText('通知'))
      expect(screen.getByText('通知一覧')).toBeInTheDocument()
      expect(screen.queryByText('設定画面')).not.toBeInTheDocument()
    })
  })
})
