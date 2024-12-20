import { createId } from '@paralleldrive/cuid2'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { AuthCodeFactory } from '@test/factories/make-auth-code'
import { ProviderFactory } from '@test/factories/make-provider'
import { bootstrap } from '../../app'
import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { getPrismaClient } from '@/infra/db/prisma'

describe('new Password', () => {
  let providerFactory: ProviderFactory
  let authCodeFactory: AuthCodeFactory
  let app: FastifyInstance
  let prisma: PrismaClient

  beforeAll(async () => {
    providerFactory = new ProviderFactory()
    authCodeFactory = new AuthCodeFactory()
    prisma = getPrismaClient()

    app = await bootstrap()
    await app.ready()
  })

  afterAll(async () => {
    vi.useRealTimers()
    await app.close()
  })

  test('[PUT] /new-password', async () => {
    const date = new Date(2024, 7, 1, 10, 40)
    vi.setSystemTime(date)

    const code = createId()

    const provider = await providerFactory.makePrismaProvider({
      password: await hash('teste-123', 8),
    })
    await authCodeFactory.makePrismaAuthCode({
      code,
      providerId: provider.id,
      createdAt: new Date(2024, 7, 1, 8, 50),
    })

    const response = await request(app.server)
      .put(`/new-password?code=${code}`)
      .send({
        password: 'teste-1234',
      })

    expect(response.statusCode).toBe(200)
    const codesInDb = await prisma.authCodes.findMany()
    expect(codesInDb.length).toBe(0)
  })
})
