import request from 'supertest'
import { ProviderFactory } from '@test/factories/make-provider'
import { getPrismaClient } from '@/infra/db/prisma'
import type { PrismaClient } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { bootstrap } from '../../app'

describe('New Event', () => {
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

  test('[POST] /provider/events/new', async () => {
    const provider = await providerFactory.makePrismaProvider({})
    const accessToken = app.jwt.sign({
      sub: provider.id.toValue(),
    })
    const response = await request(app.server)
      .post('/provider/events/new')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        duration: 60,
        startTime: new Date(2024, 1, 10, 7, 30), // 10:30
        endTime: new Date(2024, 1, 10, 10, 10), // 13:10
        startTimezone: 'America/Sao_Paulo',
        endTimezone: 'America/Sao_Paulo',
        providerId: provider.id.toValue(),
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=TU;INTERVAL=1',
        title: 'availability',
      })

    expect(response.statusCode).toBe(201)

    const firstFetchOfEventsInDatabase = await prisma.event.findMany()

    expect(firstFetchOfEventsInDatabase.length).toBe(2)
  })
})
