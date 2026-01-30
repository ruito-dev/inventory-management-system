import { render, screen } from '@testing-library/react'
import Home from '../page'

// next/imageのモック
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

describe('Home Page', () => {
  it('Next.jsロゴをレンダリングする', () => {
    render(<Home />)
    const logo = screen.getByAltText('Next.js logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/next.svg')
  })

  it('メインの見出しをレンダリングする', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', {
      name: /To get started, edit the page.tsx file./i,
    })
    expect(heading).toBeInTheDocument()
  })

  it('説明テキストをレンダリングする', () => {
    render(<Home />)
    expect(
      screen.getByText(/Looking for a starting point or more instructions?/i)
    ).toBeInTheDocument()
  })

  it('Templatesリンクをレンダリングする', () => {
    render(<Home />)
    const templatesLink = screen.getByRole('link', { name: /Templates/i })
    expect(templatesLink).toBeInTheDocument()
    expect(templatesLink).toHaveAttribute('href', expect.stringContaining('vercel.com/templates'))
  })

  it('Learningリンクをレンダリングする', () => {
    render(<Home />)
    const learningLink = screen.getByRole('link', { name: /Learning/i })
    expect(learningLink).toBeInTheDocument()
    expect(learningLink).toHaveAttribute('href', expect.stringContaining('nextjs.org/learn'))
  })

  it('Deploy Nowボタンをレンダリングする', () => {
    render(<Home />)
    const deployButton = screen.getByRole('link', { name: /Deploy Now/i })
    expect(deployButton).toBeInTheDocument()
    expect(deployButton).toHaveAttribute('href', expect.stringContaining('vercel.com/new'))
    expect(deployButton).toHaveAttribute('target', '_blank')
    expect(deployButton).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('Documentationボタンをレンダリングする', () => {
    render(<Home />)
    const docButton = screen.getByRole('link', { name: /Documentation/i })
    expect(docButton).toBeInTheDocument()
    expect(docButton).toHaveAttribute('href', expect.stringContaining('nextjs.org/docs'))
    expect(docButton).toHaveAttribute('target', '_blank')
    expect(docButton).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('Vercelロゴマークをレンダリングする', () => {
    render(<Home />)
    const vercelLogo = screen.getByAltText('Vercel logomark')
    expect(vercelLogo).toBeInTheDocument()
    expect(vercelLogo).toHaveAttribute('src', '/vercel.svg')
  })

  it('正しいレイアウトクラスを持つ', () => {
    const { container } = render(<Home />)
    const mainDiv = container.firstChild
    expect(mainDiv).toHaveClass('flex', 'min-h-screen', 'items-center', 'justify-center')
  })
})
