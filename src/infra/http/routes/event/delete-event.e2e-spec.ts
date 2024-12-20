import { ProviderFactory } from '@test/factories/make-provider'
import { EventFactory } from '@test/factories/make-events'
import { hash } from 'bcryptjs'
import request from 'supertest'
import type { FastifyInstance } from 'fastify'
import { bootstrap } from '../../app'
import { getPrismaClient } from '@/infra/db/prisma'
import type { PrismaClient } from '@prisma/client'

describe('Change Duration', () => {
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

  test('[DELETE] /provider/events', async () => {
    const provider = await providerFactory.makePrismaProvider({
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
    })
    const recurrence = await eventFactory.makePrismaEvent({
      providerId: provider.id,
      startTime: new Date(2024, 1, 9, 7, 30),
      endTime: new Date(2024, 1, 9, 8, 30),
      startTimezone: 'America/Sao_Paulo',
      endTimezone: 'America/Sao_Paulo',
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=FR;INTERVAL=1',
      title: 'availability',
      recurrenceException: '2024-02-16T07:30:00.000Z',
    })

    const event = await eventFactory.makePrismaEvent({
      providerId: provider.id,
      startTime: new Date(2024, 1, 16, 7, 30),
      endTime: new Date(2024, 1, 16, 8, 30),
      startTimezone: 'America/Sao_Paulo',
      endTimezone: 'America/Sao_Paulo',
      title: 'availability',
      recurrenceID: recurrence.id,
    })

    const accessToken = app.jwt.sign({
      sub: provider.id.toValue(),
    })

    const response1 = await request(app.server)
      .delete('/provider/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        eventId: recurrence.id.toString(),
        type: 'recurrence',
      })

    const eventsOnDatabase1 = await prisma.event.findMany()

    expect(response1.statusCode).toBe(200)
    expect(eventsOnDatabase1.length).toBe(1)
    expect(eventsOnDatabase1.at(0)?.id).toBe(event.id.toValue())
    expect(eventsOnDatabase1.at(0)?.recurrenceID).toBeNull()

    const response2 = await request(app.server)
      .delete('/provider/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        eventId: event.id.toString(),
        type: 'event',
      })

    expect(response2.statusCode).toBe(200)
    const eventsOnDatabase2 = await prisma.event.findMany()
    expect(eventsOnDatabase2.length).toBe(0)
  })
})
