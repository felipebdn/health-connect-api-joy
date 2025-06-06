import supertest from 'supertest'
import { EventFactory } from '@test/factories/make-events'
import { ProviderFactory } from '@test/factories/make-provider'
import type { FastifyInstance } from 'fastify'
import { bootstrap } from '../../app'

describe('List Availability Day', () => {
  let providerFactory: ProviderFactory
  let eventFactory: EventFactory
  let app: FastifyInstance

  beforeAll(async () => {
    providerFactory = new ProviderFactory()
    eventFactory = new EventFactory()

    vi.useFakeTimers()

    app = await bootstrap()
    await app.ready()
  })

  afterAll(async () => {
    vi.useRealTimers()
    await app.close()
  })

  test('[GET] /:providerId/availabilities/day/:date', async () => {
    const date = new Date(2023, 11, 1)
    vi.setSystemTime(date)

    const provider = await providerFactory.makePrismaProvider({})

    await eventFactory.makePrismaEvent({
      startTime: new Date(2024, 0, 1, 10),
      endTime: new Date(2024, 0, 1, 11),
      providerId: provider.id,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TH;INTERVAL=1',
      recurrenceException: `${new Date(2024, 1, 5)},${new Date(2024, 1, 29)}`,
    })
    await eventFactory.makePrismaEvent({
      startTime: new Date(2024, 1, 15, 11),
      endTime: new Date(2024, 1, 15, 12),
      providerId: provider.id,
    })
    await eventFactory.makePrismaEvent({
      startTime: new Date(2024, 1, 15, 12),
      endTime: new Date(2024, 1, 15, 13),
      providerId: provider.id,
      title: 'appointment',
    })

    const response = await supertest(app.server).get(
      `/${provider.id.toString()}/availabilities/day/${new Date(2024, 1, 15).toISOString()}`
    )

    expect(response.statusCode).toBe(200)
    expect(response.body.schedules.length).toBe(2)
  })
})
