import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'

describe('Input', () => {
  it('入力フィールドを表示する', () => {
    render(<Input />)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('placeholderを表示する', () => {
    render(<Input placeholder="名前を入力" />)

    expect(screen.getByPlaceholderText('名前を入力')).toBeInTheDocument()
  })

  it('typeを指定できる', () => {
    render(<Input type="email" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('passwordタイプを指定できる', () => {
    render(<Input type="password" />)

    const input = document.querySelector('input[type="password"]')
    expect(input).toBeInTheDocument()
  })

  it('numberタイプを指定できる', () => {
    render(<Input type="number" />)

    const input = screen.getByRole('spinbutton')
    expect(input).toBeInTheDocument()
  })

  it('値を入力できる', async () => {
    const user = userEvent.setup()
    render(<Input />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'テスト入力')

    expect(input).toHaveValue('テスト入力')
  })

  it('disabledを指定できる', () => {
    render(<Input disabled />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('readOnlyを指定できる', () => {
    render(<Input readOnly value="読み取り専用" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('readonly')
    expect(input).toHaveValue('読み取り専用')
  })

  it('カスタムclassNameを適用できる', () => {
    render(<Input className="custom-input" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input')
  })

  it('defaultValueを設定できる', () => {
    render(<Input defaultValue="初期値" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('初期値')
  })

  it('maxLengthを指定できる', () => {
    render(<Input maxLength={10} />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('maxLength', '10')
  })

  it('requiredを指定できる', () => {
    render(<Input required />)

    const input = screen.getByRole('textbox')
    expect(input).toBeRequired()
  })
})
