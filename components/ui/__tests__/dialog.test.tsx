import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../dialog'
import { Button } from '../button'

describe('Dialog', () => {
  it('トリガーボタンがレンダリングされる', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
      </Dialog>
    )
    expect(screen.getByText('Open Dialog')).toBeInTheDocument()
  })

  it('トリガーをクリックするとダイアログが開く', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open Dialog'))
    expect(screen.getByText('Test Dialog')).toBeInTheDocument()
  })

  it('制御されたダイアログが正しく動作する', () => {
    const TestComponent = () => {
      const [open, setOpen] = React.useState(true)
      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      )
    }

    render(<TestComponent />)
    expect(screen.getByText('Controlled Dialog')).toBeInTheDocument()
  })
})

describe('DialogContent', () => {
  it('コンテンツがレンダリングされる', () => {
    render(
      <Dialog open>
        <DialogContent>
          <p>Dialog Content</p>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Dialog Content')).toBeInTheDocument()
  })

  it('デフォルトで閉じるボタンが表示される', () => {
    render(
      <Dialog open>
        <DialogContent>
          <p>Content</p>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Close')).toBeInTheDocument()
  })

  it('showCloseButton=falseで閉じるボタンが非表示になる', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <p>Content</p>
        </DialogContent>
      </Dialog>
    )
    expect(screen.queryByText('Close')).not.toBeInTheDocument()
  })

  it('カスタムクラス名が適用される', () => {
    render(
      <Dialog open>
        <DialogContent className="custom-content">
          <p>Content</p>
        </DialogContent>
      </Dialog>
    )
    const content = screen.getByText('Content').parentElement
    expect(content).toHaveClass('custom-content')
  })
})

describe('DialogHeader', () => {
  it('ヘッダーがレンダリングされる', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader data-testid="header">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
    const header = screen.getByTestId('header')
    expect(header).toBeInTheDocument()
    expect(header).toHaveAttribute('data-slot', 'dialog-header')
  })

  it('カスタムクラス名が適用される', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader className="custom-header" data-testid="header">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
    const header = screen.getByTestId('header')
    expect(header).toHaveClass('custom-header')
  })
})

describe('DialogFooter', () => {
  it('フッターがレンダリングされる', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogFooter data-testid="footer">
            <Button>Action</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
    const footer = screen.getByTestId('footer')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveAttribute('data-slot', 'dialog-footer')
  })

  it('showCloseButton=trueで閉じるボタンが表示される', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogFooter showCloseButton={true}>
            <Button>Action</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
    // フッター内の閉じるボタン
    const closeButtons = screen.getAllByText('Close')
    expect(closeButtons.length).toBeGreaterThan(0)
  })

  it('カスタムクラス名が適用される', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogFooter className="custom-footer" data-testid="footer">
            <Button>Action</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
    const footer = screen.getByTestId('footer')
    expect(footer).toHaveClass('custom-footer')
  })
})

describe('DialogTitle', () => {
  it('タイトルがレンダリングされる', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Test Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('カスタムクラス名が適用される', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle className="custom-title">Test Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    const title = screen.getByText('Test Title')
    expect(title).toHaveClass('custom-title')
  })
})

describe('DialogDescription', () => {
  it('説明がレンダリングされる', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogDescription>Test Description</DialogDescription>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('カスタムクラス名が適用される', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogDescription className="custom-description">Test Description</DialogDescription>
        </DialogContent>
      </Dialog>
    )
    const description = screen.getByText('Test Description')
    expect(description).toHaveClass('custom-description')
  })
})

describe('DialogClose', () => {
  it('閉じるボタンがレンダリングされる', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogClose asChild>
            <Button>Custom Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Custom Close')).toBeInTheDocument()
  })
})

describe('Dialog統合テスト', () => {
  it('完全なダイアログがレンダリングされる', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Dialog</DialogTitle>
            <DialogDescription>This is a complete dialog example</DialogDescription>
          </DialogHeader>
          <div>Dialog body content</div>
          <DialogFooter>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))
    expect(screen.getByText('Complete Dialog')).toBeInTheDocument()
    expect(screen.getByText('This is a complete dialog example')).toBeInTheDocument()
    expect(screen.getByText('Dialog body content')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })
})
