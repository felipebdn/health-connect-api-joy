import supertest from 'supertest'
import { AppointmentFactory } from '@test/factories/make-appointment'
import { EventFactory } from '@test/factories/make-events'
import { ProviderFactory } from '@test/factories/make-provider'
import type { FastifyInstance } from 'fastify'
import { bootstrap } from '../../app'

describe('List Appointment', () => {
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

  test('[GET] /appointment/list?email=&cpf=', async () => {
    const provider = await providerFactory.makePrismaProvider({})

    const event = await eventFactory.makePrismaEvent({
      startTime: new Date(2024, 0, 1, 10),
      endTime: new Date(2024, 0, 1, 11),
      providerId: provider.id,
      title: 'appointment',
    })

    await appointmentFactory.makePrismaAppointment({
      cpf: '12345678909',
      email: 'johndoe@example.com',
      eventId: event.id,
      providerId: provider.id,
    })

    const response1 = await supertest(app.server).get(
      '/appointment/list?email=johndoe@example.com'
    )

    expect(response1.statusCode).toBe(200)

    expect(response1.body.appointments).length(1)

    const response2 = await supertest(app.server).get(
      '/appointment/list?cpf=12345678909'
    )

    expect(response2.statusCode).toBe(200)

    expect(response2.body.appointments).length(1)
  })
})
