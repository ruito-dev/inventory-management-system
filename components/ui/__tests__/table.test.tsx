import { render, screen } from '@testing-library/react'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '../table'

describe('Table Components', () => {
  describe('Table', () => {
    it('テーブルを表示する', () => {
      const { container } = render(<Table>テーブル内容</Table>)

      const table = container.querySelector('table')
      expect(table).toBeInTheDocument()
    })

    it('カスタムclassNameを適用できる', () => {
      const { container } = render(<Table className="custom-table">内容</Table>)

      const table = container.querySelector('table')
      expect(table).toHaveClass('custom-table')
    })
  })

  describe('TableHeader', () => {
    it('ヘッダーを表示する', () => {
      const { container } = render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ヘッダー</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )

      const thead = container.querySelector('thead')
      expect(thead).toBeInTheDocument()
    })
  })

  describe('TableBody', () => {
    it('ボディを表示する', () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>データ</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      const tbody = container.querySelector('tbody')
      expect(tbody).toBeInTheDocument()
    })
  })

  describe('TableFooter', () => {
    it('フッターを表示する', () => {
      const { container } = render(
        <Table>
          <TableFooter>
            <TableRow>
              <TableCell>フッター</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )

      const tfoot = container.querySelector('tfoot')
      expect(tfoot).toBeInTheDocument()
    })
  })

  describe('TableHead', () => {
    it('ヘッダーセルを表示する', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>列名</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )

      expect(screen.getByText('列名')).toBeInTheDocument()
    })

    it('th要素として描画される', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>列名</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      )

      const th = screen.getByText('列名')
      expect(th.tagName).toBe('TH')
    })
  })

  describe('TableRow', () => {
    it('行を表示する', () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>データ</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      const tr = container.querySelector('tr')
      expect(tr).toBeInTheDocument()
    })
  })

  describe('TableCell', () => {
    it('セルを表示する', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>セルデータ</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      expect(screen.getByText('セルデータ')).toBeInTheDocument()
    })

    it('td要素として描画される', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>データ</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

      const td = screen.getByText('データ')
      expect(td.tagName).toBe('TD')
    })
  })

  describe('TableCaption', () => {
    it('キャプションを表示する', () => {
      render(
        <Table>
          <TableCaption>テーブルの説明</TableCaption>
        </Table>
      )

      expect(screen.getByText('テーブルの説明')).toBeInTheDocument()
    })

    it('caption要素として描画される', () => {
      render(
        <Table>
          <TableCaption>説明</TableCaption>
        </Table>
      )

      const caption = screen.getByText('説明')
      expect(caption.tagName).toBe('CAPTION')
    })
  })

  describe('Table 統合', () => {
    it('完全なテーブル構造を表示できる', () => {
      render(
        <Table>
          <TableCaption>商品一覧</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>商品名</TableHead>
              <TableHead>価格</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>商品A</TableCell>
              <TableCell>¥1,000</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>商品B</TableCell>
              <TableCell>¥2,000</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>合計</TableCell>
              <TableCell>¥3,000</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )

      expect(screen.getByText('商品一覧')).toBeInTheDocument()
      expect(screen.getByText('商品名')).toBeInTheDocument()
      expect(screen.getByText('価格')).toBeInTheDocument()
      expect(screen.getByText('商品A')).toBeInTheDocument()
      expect(screen.getByText('¥1,000')).toBeInTheDocument()
      expect(screen.getByText('商品B')).toBeInTheDocument()
      expect(screen.getByText('¥2,000')).toBeInTheDocument()
      expect(screen.getByText('合計')).toBeInTheDocument()
      expect(screen.getByText('¥3,000')).toBeInTheDocument()
    })
  })
})
