import supertest from 'supertest'
import { ProviderFactory } from '@test/factories/make-provider'
import { EventFactory } from '@test/factories/make-events'
import { AppointmentFactory } from '@test/factories/make-appointment'
import type { FastifyInstance } from 'fastify'
import { bootstrap } from '../../app'

describe('List Events Provider', () => {
  let providerFactory: ProviderFactory
  let eventFactory: EventFactory
  let appointmentFactory: AppointmentFactory
  let app: FastifyInstance

  beforeAll(async () => {
    providerFactory = new ProviderFactory()
    eventFactory = new EventFactory()
    appointmentFactory = new AppointmentFactory()

    app = await bootstrap()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /provider/:providerId/events', async () => {
    const provider = await providerFactory.makePrismaProvider({})
    await eventFactory.makePrismaEvent({
      startTime: new Date(2024, 0, 1, 10),
      endTime: new Date(2024, 0, 1, 11),
      providerId: provider.id,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TH;INTERVAL=1',
      recurrenceException: `${new Date(2024, 1, 5)}`,
    })
    await eventFactory.makePrismaEvent({
      startTime: new Date(2024, 0, 1, 11),
      endTime: new Date(2024, 0, 1, 12),
      providerId: provider.id,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TH;INTERVAL=1',
    })
    await eventFactory.makePrismaEvent({
      startTime: new Date(2024, 0, 1, 12),
      endTime: new Date(2024, 0, 1, 13),
      providerId: provider.id,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TH;INTERVAL=1',
    })
    await eventFactory.makePrismaEvent({
      startTime: new Date(2024, 1, 5, 9),
      endTime: new Date(2024, 1, 5, 10),
      providerId: provider.id,
    })
    const event = await eventFactory.makePrismaEvent({
      startTime: new Date(2024, 1, 5, 10),
      endTime: new Date(2024, 1, 5, 11),
      providerId: provider.id,
      title: 'appointment',
    })
    await appointmentFactory.makePrismaAppointment({
      eventId: event.id,
      providerId: provider.id,
    })

    const accessToken = app.jwt.sign({
      sub: provider.id.toValue(),
    })

    const response = await supertest(app.server)
      .get(`/provider/${provider.id.toString()}/events`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.body.events.length).toBe(5)
  })
})
