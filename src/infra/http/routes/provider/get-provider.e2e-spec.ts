import { hash } from 'bcryptjs'
import request from 'supertest'
import { bootstrap } from '../../app'
import { ProviderFactory } from '@test/factories/make-provider'
import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { getPrismaClient } from '@/infra/db/prisma'

describe('Get Provider', () => {
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

  test('[GET] /provider/:providerId', async () => {
    const provider = await providerFactory.makePrismaProvider({
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
    })
    const response = await request(app.server)
      .get(`/provider/${provider.id.toString()}`)
      .send({
        email: 'johndoe@example.com',
        password: '123456',
      })

    const providerInDateBase = await prisma.provider.findUniqueOrThrow({
      where: {
        id: provider.id.toValue(),
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.body.provider.id).toBe(providerInDateBase.id)
  })
})
