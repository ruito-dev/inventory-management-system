import React from 'react'
import { render } from '@testing-library/react'
import { Toaster } from '../sonner'
import * as nextThemes from 'next-themes'

// next-themesをモック
jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({
    theme: 'light',
  })),
}))

// sonnerをモック
jest.mock('sonner', () => ({
  Toaster: ({ theme, className }: { theme?: string; className?: string }) => (
    <div data-testid="toaster" data-theme={theme} className={className}>
      Toaster
    </div>
  ),
}))

describe('Toaster', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Toasterがレンダリングされる', () => {
    const { getByTestId } = render(<Toaster />)
    expect(getByTestId('toaster')).toBeInTheDocument()
  })

  it('カスタムプロパティが適用される', () => {
    const { getByTestId } = render(<Toaster position="top-right" />)
    expect(getByTestId('toaster')).toBeInTheDocument()
  })

  it('テーマがダークモードの場合', () => {
    jest.spyOn(nextThemes, 'useTheme').mockReturnValue({
      theme: 'dark',
      setTheme: jest.fn(),
      systemTheme: undefined,
      themes: [],
      resolvedTheme: 'dark',
    })

    const { getByTestId } = render(<Toaster />)
    const toaster = getByTestId('toaster')
    expect(toaster).toBeInTheDocument()
    expect(toaster).toHaveAttribute('data-theme', 'dark')
  })

  it('テーマがシステムの場合', () => {
    jest.spyOn(nextThemes, 'useTheme').mockReturnValue({
      theme: 'system',
      setTheme: jest.fn(),
      systemTheme: undefined,
      themes: [],
      resolvedTheme: 'system',
    })

    const { getByTestId } = render(<Toaster />)
    const toaster = getByTestId('toaster')
    expect(toaster).toBeInTheDocument()
    expect(toaster).toHaveAttribute('data-theme', 'system')
  })

  it('テーマが未定義の場合はsystemがデフォルト', () => {
    jest.spyOn(nextThemes, 'useTheme').mockReturnValue({
      theme: undefined,
      setTheme: jest.fn(),
      systemTheme: undefined,
      themes: [],
      resolvedTheme: undefined,
    })

    const { getByTestId } = render(<Toaster />)
    const toaster = getByTestId('toaster')
    expect(toaster).toBeInTheDocument()
    expect(toaster).toHaveAttribute('data-theme', 'system')
  })
})
