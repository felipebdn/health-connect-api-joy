import { hash } from 'bcryptjs'
import request from 'supertest'
import { ProviderFactory } from '@test/factories/make-provider'
import type { FastifyInstance } from 'fastify'
import { bootstrap } from '../../app'
import type { PrismaClient } from '@prisma/client'
import { getPrismaClient } from '@/infra/db/prisma'

describe('Change Duration', () => {
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

  test('[PUT] /provider/:providerId/duration', async () => {
    const provider = await providerFactory.makePrismaProvider({
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
    })

    const accessToken = app.jwt.sign({
      sub: provider.id.toValue(),
    })

    const response = await request(app.server)
      .put(`/provider/${provider.id.toString()}/duration`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        duration: 120,
      })

    const providerOnDatabase = await prisma.provider.findUnique({
      where: {
        email: 'johndoe@example.com',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(providerOnDatabase?.duration).toBe(7200)
  })
})
