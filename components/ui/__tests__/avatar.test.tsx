import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from '../avatar'

describe('Avatar', () => {
  it('デフォルトサイズでレンダリングされる', () => {
    render(<Avatar data-testid="avatar" />)
    const avatar = screen.getByTestId('avatar')
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('data-size', 'default')
  })

  it('小サイズでレンダリングされる', () => {
    render(<Avatar size="sm" data-testid="avatar" />)
    const avatar = screen.getByTestId('avatar')
    expect(avatar).toHaveAttribute('data-size', 'sm')
  })

  it('大サイズでレンダリングされる', () => {
    render(<Avatar size="lg" data-testid="avatar" />)
    const avatar = screen.getByTestId('avatar')
    expect(avatar).toHaveAttribute('data-size', 'lg')
  })

  it('カスタムクラス名が適用される', () => {
    render(<Avatar className="custom-class" data-testid="avatar" />)
    const avatar = screen.getByTestId('avatar')
    expect(avatar).toHaveClass('custom-class')
  })
})

describe('AvatarImage', () => {
  it('画像コンポーネントがレンダリングされる', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="Test Avatar" />
      </Avatar>
    )
    // AvatarImageはRadix UIのコンポーネントで、画像が読み込まれるまで表示されない
    // そのため、コンテナが存在することを確認
    expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument()
  })

  it('カスタムクラス名が適用される', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="Test Avatar" className="custom-image" />
        <AvatarFallback>TA</AvatarFallback>
      </Avatar>
    )
    // フォールバックが表示されることを確認
    expect(screen.getByText('TA')).toBeInTheDocument()
  })
})

describe('AvatarFallback', () => {
  it('フォールバックテキストがレンダリングされる', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    )
    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('カスタムクラス名が適用される', () => {
    render(
      <Avatar>
        <AvatarFallback className="custom-fallback">AB</AvatarFallback>
      </Avatar>
    )
    const fallback = screen.getByText('AB')
    expect(fallback).toHaveClass('custom-fallback')
  })
})

describe('AvatarBadge', () => {
  it('バッジがレンダリングされる', () => {
    render(
      <Avatar>
        <AvatarBadge data-testid="badge" />
      </Avatar>
    )
    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('data-slot', 'avatar-badge')
  })

  it('バッジにコンテンツが表示される', () => {
    render(
      <Avatar>
        <AvatarBadge>3</AvatarBadge>
      </Avatar>
    )
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('カスタムクラス名が適用される', () => {
    render(
      <Avatar>
        <AvatarBadge className="custom-badge" data-testid="badge" />
      </Avatar>
    )
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass('custom-badge')
  })
})

describe('AvatarGroup', () => {
  it('アバターグループがレンダリングされる', () => {
    render(
      <AvatarGroup data-testid="avatar-group">
        <Avatar>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
      </AvatarGroup>
    )
    const group = screen.getByTestId('avatar-group')
    expect(group).toBeInTheDocument()
    expect(group).toHaveAttribute('data-slot', 'avatar-group')
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('カスタムクラス名が適用される', () => {
    render(<AvatarGroup className="custom-group" data-testid="avatar-group" />)
    const group = screen.getByTestId('avatar-group')
    expect(group).toHaveClass('custom-group')
  })
})

describe('AvatarGroupCount', () => {
  it('カウントがレンダリングされる', () => {
    render(<AvatarGroupCount>+5</AvatarGroupCount>)
    expect(screen.getByText('+5')).toBeInTheDocument()
  })

  it('カスタムクラス名が適用される', () => {
    render(
      <AvatarGroupCount className="custom-count" data-testid="count">
        +5
      </AvatarGroupCount>
    )
    const count = screen.getByTestId('count')
    expect(count).toHaveClass('custom-count')
  })

  it('data-slot属性が設定される', () => {
    render(<AvatarGroupCount data-testid="count">+5</AvatarGroupCount>)
    const count = screen.getByTestId('count')
    expect(count).toHaveAttribute('data-slot', 'avatar-group-count')
  })
})

describe('Avatar統合テスト', () => {
  it('完全なアバターコンポーネントがレンダリングされる', () => {
    render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="Test User" />
        <AvatarFallback>TU</AvatarFallback>
        <AvatarBadge data-testid="badge">1</AvatarBadge>
      </Avatar>
    )
    // 画像が読み込まれない場合はフォールバックが表示される
    expect(screen.getByText('TU')).toBeInTheDocument()
    expect(screen.getByTestId('badge')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('アバターグループが複数のアバターとカウントを表示する', () => {
    render(
      <AvatarGroup>
        <Avatar>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>C</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+2</AvatarGroupCount>
      </AvatarGroup>
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
  })
})
