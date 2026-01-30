import { PrismaClient } from '@prisma/client'

// Prismaクライアントをモック
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  }
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  }
})

interface GlobalWithPrisma {
  prisma?: PrismaClient
}

describe('Prisma Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // グローバルなprismaインスタンスをクリア
    delete (globalThis as GlobalWithPrisma).prisma
  })

  it('PrismaClientがインスタンス化される', async () => {
    // prisma.tsを動的にインポート
    const prismaModule = await import('../prisma')

    expect(prismaModule.prisma).toBeDefined()
    expect(PrismaClient).toHaveBeenCalled()
  })

  it('prismaインスタンスが存在する', async () => {
    const prismaModule = await import('../prisma')
    expect(prismaModule.prisma).toBeDefined()
  })
})
