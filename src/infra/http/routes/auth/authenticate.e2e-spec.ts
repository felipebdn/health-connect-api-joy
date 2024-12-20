import { ProviderFactory } from '@test/factories/make-provider'
import { hash } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import request from 'supertest'
import { bootstrap } from '../../app'

describe('Authenticate Provider', () => {
  let providerFactory: ProviderFactory
  let app: FastifyInstance

  beforeAll(async () => {
    providerFactory = new ProviderFactory()

    app = await bootstrap()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /session/provider', async () => {
    await providerFactory.makePrismaProvider({
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
    })

    const response = await request(app.server).post('/session/provider').send({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(response.statusCode).toBe(200)

    expect(response.body).toEqual({ accessToken: expect.any(String) })
  })
})
