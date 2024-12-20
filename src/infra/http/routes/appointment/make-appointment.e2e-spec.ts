import supertest from 'supertest'
import { EventFactory } from '@test/factories/make-events'
import { ProviderFactory } from '@test/factories/make-provider'
import { getPrismaClient } from '@/infra/db/prisma'
import type { PrismaClient } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { bootstrap } from '../../app'

describe('Make Appointment', () => {
  let providerFactory: ProviderFactory
  let eventFactory: EventFactory
  let app: FastifyInstance
  let prisma: PrismaClient

  beforeAll(async () => {
    providerFactory = new ProviderFactory()
    eventFactory = new EventFactory()
    prisma = getPrismaClient()

    vi.useFakeTimers()

    app = await bootstrap()
    await app.ready()
  })

  afterAll(async () => {
    vi.useRealTimers()
    await app.close()
  })

  test('[POST] /appointment/new', async () => {
    const date = new Date(2023, 11, 1)
    vi.setSystemTime(date)
    const provider = await providerFactory.makePrismaProvider({})

    const recurrence = await eventFactory.makePrismaEvent({
      startTime: new Date(2024, 0, 1, 10),
      endTime: new Date(2024, 0, 1, 11),
      providerId: provider.id,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TH;INTERVAL=1',
    })

    const availability = await eventFactory.makePrismaEvent({
      startTime: new Date(2024, 1, 5, 11),
      endTime: new Date(2024, 1, 5, 12),
      providerId: provider.id,
    })

    const response1 = await supertest(app.server)
      .post('/appointment/new')
      .send({
        providerId: provider.id.toValue(),
        eventId: recurrence.id.toValue(),
        date: new Date(2024, 1, 5),
        name: 'john doe',
        email: 'johndoe@example.com',
        cpf: '12345678909',
        phone: '12345678909',
        description: 'Example description',
      })

    expect(response1.statusCode).toBe(201)
    const recurrenceInDatabase = await prisma.event.findUniqueOrThrow({
      where: {
        id: recurrence.id.toValue(),
      },
    })
    expect(recurrenceInDatabase.recurrenceException).toBeTruthy()

    const response2 = await supertest(app.server)
      .post('/appointment/new')
      .send({
        providerId: provider.id.toValue(),
        eventId: availability.id.toValue(),
        name: 'john doe',
        email: 'johndoe@example.com',
        cpf: '12345678909',
        phone: '12345678909',
        description: 'Example description',
      })

    expect(response2.statusCode).toBe(201)

    const appointmentsInDatabase = await prisma.appointment.findMany()
    const availabilitiesInDatabase = await prisma.event.findMany({
      where: {
        title: 'availability',
      },
    })

    expect(appointmentsInDatabase.length).toBe(2)

    expect(availabilitiesInDatabase.length).toBe(1)
    expect(availabilitiesInDatabase.at(0)?.id).toBe(recurrence.id.toValue())
  })
})
