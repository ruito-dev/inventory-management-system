import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../form'
import { Input } from '../input'
import { Button } from '../button'

describe('FormItem', () => {
  it('フォームアイテムがレンダリングされる', () => {
    const TestForm = () => {
      const form = useForm()
      return (
        <Form {...form}>
          <FormItem data-testid="form-item">
            <p>Form Item Content</p>
          </FormItem>
        </Form>
      )
    }

    render(<TestForm />)
    const item = screen.getByTestId('form-item')
    expect(item).toBeInTheDocument()
    expect(item).toHaveAttribute('data-slot', 'form-item')
  })

  it('カスタムクラス名が適用される', () => {
    const TestForm = () => {
      const form = useForm()
      return (
        <Form {...form}>
          <FormItem className="custom-item" data-testid="form-item">
            <p>Content</p>
          </FormItem>
        </Form>
      )
    }

    render(<TestForm />)
    const item = screen.getByTestId('form-item')
    expect(item).toHaveClass('custom-item')
  })
})

describe('FormLabel', () => {
  it('ラベルがレンダリングされる', () => {
    const TestForm = () => {
      const form = useForm({
        defaultValues: {
          username: '',
        },
      })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<TestForm />)
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('エラー時にdata-error属性が設定される', () => {
    const TestForm = () => {
      const form = useForm({
        defaultValues: {
          username: '',
        },
      })

      React.useEffect(() => {
        form.setError('username', { message: 'Required' })
      }, [form])

      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<TestForm />)
    const label = screen.getByText('Username')
    expect(label).toHaveAttribute('data-error', 'true')
  })
})

describe('FormControl', () => {
  it('フォームコントロールがレンダリングされる', () => {
    const TestForm = () => {
      const form = useForm({
        defaultValues: {
          email: '',
        },
      })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="email@example.com" />
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<TestForm />)
    const input = screen.getByPlaceholderText('email@example.com')
    expect(input).toBeInTheDocument()
  })

  it('エラー時にaria-invalid属性が設定される', () => {
    const TestForm = () => {
      const form = useForm({
        defaultValues: {
          email: '',
        },
      })

      React.useEffect(() => {
        form.setError('email', { message: 'Invalid email' })
      }, [form])

      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<TestForm />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('FormDescription', () => {
  it('説明がレンダリングされる', () => {
    const TestForm = () => {
      const form = useForm({
        defaultValues: {
          username: '',
        },
      })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>This is your public display name.</FormDescription>
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<TestForm />)
    expect(screen.getByText('This is your public display name.')).toBeInTheDocument()
  })

  it('カスタムクラス名が適用される', () => {
    const TestForm = () => {
      const form = useForm({
        defaultValues: {
          username: '',
        },
      })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription className="custom-description">Description</FormDescription>
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<TestForm />)
    const description = screen.getByText('Description')
    expect(description).toHaveClass('custom-description')
  })
})

describe('FormMessage', () => {
  it('エラーメッセージが表示される', () => {
    const TestForm = () => {
      const form = useForm({
        defaultValues: {
          username: '',
        },
      })

      React.useEffect(() => {
        form.setError('username', { message: 'Username is required' })
      }, [form])

      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<TestForm />)
    expect(screen.getByText('Username is required')).toBeInTheDocument()
  })

  it('エラーがない場合はメッセージが表示されない', () => {
    const TestForm = () => {
      const form = useForm({
        defaultValues: {
          username: '',
        },
      })

      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<TestForm />)
    const message = screen.queryByText(/required/i)
    expect(message).not.toBeInTheDocument()
  })

  it('カスタムメッセージが表示される', () => {
    const TestForm = () => {
      const form = useForm({
        defaultValues: {
          username: '',
        },
      })

      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage>Custom message</FormMessage>
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<TestForm />)
    expect(screen.getByText('Custom message')).toBeInTheDocument()
  })
})

describe('Form統合テスト', () => {
  it('完全なフォームがレンダリングされる', () => {
    const TestForm = () => {
      const form = useForm({
        defaultValues: {
          username: '',
          email: '',
        },
      })

      return (
        <Form {...form}>
          <form>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Your public username</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormDescription>Your email address</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      )
    }

    render(<TestForm />)
    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(screen.getByText('Your public username')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Your email address')).toBeInTheDocument()
  })

  it('フォーム送信とバリデーションが動作する', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()

    const TestForm = () => {
      const form = useForm({
        defaultValues: {
          username: '',
        },
      })

      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="username"
              rules={{ required: 'Username is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      )
    }

    render(<TestForm />)

    // 空のまま送信
    await user.click(screen.getByText('Submit'))
    expect(screen.getByText('Username is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    // 値を入力して送信
    const input = screen.getByRole('textbox')
    await user.type(input, 'testuser')
    await user.click(screen.getByText('Submit'))
    expect(onSubmit).toHaveBeenCalledWith({ username: 'testuser' }, expect.anything())
  })
})
