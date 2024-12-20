import supertest from 'supertest'
import { ProviderFactory } from '@test/factories/make-provider'
import type { FastifyInstance } from 'fastify'
import { bootstrap } from '../../app'
import type { PrismaClient } from '@prisma/client'
import { getPrismaClient } from '@/infra/db/prisma'

describe('Update Provider', () => {
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

  test('[POST] /provider/:providerId/update', async () => {
    const provider = await providerFactory.makePrismaProvider({
      name: 'john doe',
      email: 'johndoe@example.com',
      phone: '12345678909',
      birthday: new Date(2000, 1, 1),
      price: 120,
      duration: 60,
      specialty: 'specialty example',
    })

    const accessToken = app.jwt.sign({
      sub: provider.id.toValue(),
    })

    const response = await supertest(app.server)
      .put(`/provider/${provider.id.toString()}/update`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'doe john',
        phone: '12345678919',
        birthday: new Date(2000, 1, 2),
        price: 300,
        duration: 120,
        specialty: 'example specialty',
      })

    const providerInDatabase = await prisma.provider.findUniqueOrThrow({
      where: {
        id: provider.id.toValue(),
      },
    })

    expect(response.statusCode).toBe(200)
    expect(providerInDatabase.name).toEqual('doe john')
    expect(providerInDatabase.price).toEqual(300)
  })
})
