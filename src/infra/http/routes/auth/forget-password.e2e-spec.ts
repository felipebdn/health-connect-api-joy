import { hash } from 'bcryptjs'
import request from 'supertest'
import { ProviderFactory } from '@test/factories/make-provider'
import { getPrismaClient } from '@/infra/db/prisma'
import type { PrismaClient } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { bootstrap } from '../../app'

describe('Forget Password', () => {
  let providerFactory: ProviderFactory
  let app: FastifyInstance
  let prisma: PrismaClient

  beforeAll(async () => {
    providerFactory = new ProviderFactory()
    prisma = getPrismaClient()

    app = await bootstrap()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /session/forgot-password', async () => {
    await providerFactory.makePrismaProvider({
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
    })

    const response = await request(app.server)
      .post('/session/forgot-password')
      .send({
        email: 'johndoe@example.com',
        url: 'http://localhost:3000',
      })

    const codeAuthOnDb = await prisma.authCode.findMany()

    expect(response.statusCode).toBe(200)
    expect(codeAuthOnDb.length).toBe(1)
  })
})
