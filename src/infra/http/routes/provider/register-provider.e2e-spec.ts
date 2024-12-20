import request from 'supertest'
import { bootstrap } from '../../app'
import type { FastifyInstance } from 'fastify'

describe('Register Provider', () => {
  let app: FastifyInstance
  beforeAll(async () => {
    app = await bootstrap()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /provider/register', async () => {
    const response = await request(app.server)
      .post('/provider/register')
      .send({
        name: 'john doe',
        email: 'johndoe@example.com',
        phone: '12345678909',
        birthday: new Date(2000, 1, 1),
        price: 300,
        duration: 60,
        cpf: '12345678909',
        password: '123456',
        specialty: 'general practitioner',
      })

    expect(response.statusCode).toBe(201)
  })
})
