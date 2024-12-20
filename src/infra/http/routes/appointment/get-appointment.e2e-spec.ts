import request from 'supertest'
import { EventFactory } from '@test/factories/make-events'
import { ProviderFactory } from '@test/factories/make-provider'
import { AppointmentFactory } from '@test/factories/make-appointment'
import { getPrismaClient } from '@/infra/db/prisma'
import type { PrismaClient } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { bootstrap } from '../../app'

describe.only('Get Appointment', () => {
  let providerFactory: ProviderFactory
  let eventFactory: EventFactory
  let appointmentFactory: AppointmentFactory
  let app: FastifyInstance
  let prisma: PrismaClient

  beforeAll(async () => {
    providerFactory = new ProviderFactory()
    eventFactory = new EventFactory()
    appointmentFactory = new AppointmentFactory()
    prisma = getPrismaClient()

    app = await bootstrap()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /appointment/:appointmentId', async () => {
    const provider = await providerFactory.makePrismaProvider({})
    const event = await eventFactory.makePrismaEvent({
      providerId: provider.id,
    })
    await appointmentFactory.makePrismaAppointment({
      providerId: provider.id,
      eventId: event.id,
    })

    const response = await request(app.server)
      .get(`/appointment/${event.id.toValue()}`)
      .send()

    const providerOnDatabase = await prisma.appointment.findMany()

    expect(response.statusCode).toBe(200)
    expect(providerOnDatabase.length).toBe(1)

    expect(response.body.appointment).toBeTruthy()
  })
})
