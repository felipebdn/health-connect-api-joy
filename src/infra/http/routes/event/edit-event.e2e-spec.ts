import { hash } from 'bcryptjs'
import request from 'supertest'
import { EventFactory } from '@test/factories/make-events'
import { ProviderFactory } from '@test/factories/make-provider'
import { getPrismaClient } from '@/infra/db/prisma'
import type { PrismaClient } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { bootstrap } from '../../app'

describe('Edit Event', () => {
  let providerFactory: ProviderFactory
  let eventFactory: EventFactory
  let app: FastifyInstance
  let prisma: PrismaClient

  beforeAll(async () => {
    providerFactory = new ProviderFactory()
    eventFactory = new EventFactory()
    prisma = getPrismaClient()

    app = await bootstrap()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[PUT] /provider/events/:eventId', async () => {
    const provider = await providerFactory.makePrismaProvider({
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
    })
    const event = await eventFactory.makePrismaEvent({
      endTime: new Date(2024, 1, 9, 8, 30),
      startTime: new Date(2024, 1, 9, 7, 30),
      providerId: provider.id,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=FR;INTERVAL=1',
      title: 'availability',
    })

    const accessToken = app.jwt.sign({
      sub: provider.id.toValue(),
    })

    const response1 = await request(app.server)
      .put(`/provider/events/${event.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        providerId: provider.id.toString(),
        type: 'event',
        startTime: new Date(2024, 1, 9, 9, 30),
        endTime: new Date(2024, 1, 9, 10, 30),
        startTimezone: 'America/Sao_Paulo',
        endTimezone: 'America/Sao_Paulo',
        currentStartTime: new Date(2024, 1, 9, 7, 30),
      })

    expect(response1.statusCode).toBe(200)

    const response2 = await request(app.server)
      .put(`/provider/events/${event.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        providerId: provider.id.toString(),
        type: 'recurrence',
        startTime: new Date(2024, 1, 9, 6, 30),
        endTime: new Date(2024, 1, 9, 7, 30),
        startTimezone: 'America/Sao_Paulo',
        endTimezone: 'America/Sao_Paulo',
      })
    expect(response2.statusCode).toBe(200)

    const eventsOnDatabase = await prisma.event.findMany()

    expect(eventsOnDatabase.length).toBe(2)
    expect(eventsOnDatabase.at(0)?.startTime).toEqual(
      new Date(2024, 1, 9, 9, 30)
    )
    expect(eventsOnDatabase.at(0)?.recurrenceID).toBe(event.id.toString())
  })
})
