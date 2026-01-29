/**
 * @jest-environment node
 */
import { POST } from '../route'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { NextRequest } from 'next/server'

// Prismaのモック
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// bcryptjsのモック
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}))

describe('/api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    it('正常にユーザーを登録できる', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER' as const,
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(hash as jest.Mock).mockResolvedValue('hashed-password')
      ;(prisma.user.create as jest.Mock).mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'testpass123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      })
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
      expect(hash).toHaveBeenCalledWith('testpass123', 12)
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashed-password',
          name: 'Test User',
          role: 'USER',
        },
      })
    })

    it('メールアドレスが既に登録されている場合はエラーを返す', async () => {
      const existingUser = {
        id: 'existing-id',
        email: 'test@example.com',
        name: 'Existing User',
        role: 'USER' as const,
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'testpass123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'このメールアドレスは既に登録されています' })
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it('無効なメールアドレスの場合はエラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'invalid-email',
          password: 'testpass123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: '有効なメールアドレスを入力してください' })
      expect(prisma.user.findUnique).not.toHaveBeenCalled()
    })

    it('パスワードが8文字未満の場合はエラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'short',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'パスワードは8文字以上である必要があります' })
      expect(prisma.user.findUnique).not.toHaveBeenCalled()
    })

    it('名前が空の場合はエラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: '',
          email: 'test@example.com',
          password: 'testpass123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: '名前を入力してください' })
      expect(prisma.user.findUnique).not.toHaveBeenCalled()
    })

    it('データベースエラーの場合は500エラーを返す', async () => {
      // console.errorをモック
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'testpass123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'ユーザー登録に失敗しました' })
      expect(consoleErrorSpy).toHaveBeenCalledWith('Signup error:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })
  })
})
