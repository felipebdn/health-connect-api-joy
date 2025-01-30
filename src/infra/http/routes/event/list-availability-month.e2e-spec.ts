import supertest from 'supertest'
import { EventFactory } from '@test/factories/make-events'
import { ProviderFactory } from '@test/factories/make-provider'
import type { FastifyInstance } from 'fastify'
import { bootstrap } from '../../app'

describe('List Availability Month', () => {
  let providerFactory: ProviderFactory
  let eventFactory: EventFactory
  let app: FastifyInstance

  beforeAll(async () => {
    providerFactory = new ProviderFactory()
    eventFactory = new EventFactory()

    app = await bootstrap()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /:providerId/availabilities/month/:date', async () => {
    const provider = await providerFactory.makePrismaProvider({})

    await eventFactory.makePrismaEvent({
      startTime: new Date(2024, 11, 23, 10, 40),
      endTime: new Date(2024, 11, 23, 11),
      providerId: provider.id,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TH;INTERVAL=1',
      recurrenceException: '',
    })

    const response = await supertest(app.server).get(
      `/${provider.id.toString()}/availabilities/month/${new Date(2024, 11, 21).toISOString()}`
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.dates.length).toBe(3)
  })
})
