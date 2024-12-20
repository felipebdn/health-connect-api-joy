import { makeAppointment } from '@test/factories/make-appointment'
import { makeEvent } from '@test/factories/make-events'
import { makeProvider } from '@test/factories/make-provider'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointment-repository'
import { InMemoryEventRepository } from '@test/repositories/in-memory-events-repository'
import { InMemoryProviderRepository } from '@test/repositories/in-memory-provider-repository'
import { ListAvailabilityByMonthUseCase } from './list-availability-month-use-case'

let inMemoryEventRepository: InMemoryEventRepository
let inMemoryProviderRepository: InMemoryProviderRepository
let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let sut: ListAvailabilityByMonthUseCase

describe('List availability of month', () => {
  beforeEach(() => {
    inMemoryProviderRepository = new InMemoryProviderRepository()
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryEventRepository = new InMemoryEventRepository(
      inMemoryAppointmentRepository
    )

    sut = new ListAvailabilityByMonthUseCase(
      inMemoryEventRepository,
      inMemoryProviderRepository
    )

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to list days on availability by months', async () => {
    const date = new Date(2024, 1, 1)
    vi.setSystemTime(date)

    const provider = makeProvider()
    inMemoryProviderRepository.items.push(provider)

    const recurrence1 = makeEvent({
      startTime: new Date(2024, 0, 10, 10, 30),
      endTime: new Date(2024, 0, 10, 11, 30),
      providerId: provider.id,
      title: 'availability',
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=TU;INTERVAL=1',
      recurrenceException: `${new Date(2024, 3, 2).toISOString()},${new Date(2024, 3, 9).toISOString()}`,
    })
    const recurrence2 = makeEvent({
      startTime: new Date(2024, 3, 5, 10, 30),
      endTime: new Date(2024, 3, 5, 11, 30),
      providerId: provider.id,
      title: 'availability',
    })
    const recurrence3 = makeEvent({
      startTime: new Date(2024, 0, 10, 10, 30),
      endTime: new Date(2024, 0, 10, 11, 30),
      providerId: provider.id,
      title: 'availability',
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=TH;INTERVAL=1',
      recurrenceException: `${new Date(2024, 3, 4).toISOString()},${new Date(2024, 3, 11).toISOString()},${new Date(2024, 3, 18).toISOString()}`,
    })

    const recurrence4 = makeEvent({
      startTime: new Date(2024, 3, 5, 12, 30),
      endTime: new Date(2024, 3, 5, 13, 30),
      providerId: provider.id,
      title: 'availability',
    })
    inMemoryEventRepository.items.push(
      recurrence1,
      recurrence2,
      recurrence3,
      recurrence4
    )

    inMemoryAppointmentRepository.items.push(
      makeAppointment({
        providerId: provider.id,
        eventId: recurrence1.id,
      }),
      makeAppointment({
        providerId: provider.id,
        eventId: recurrence3.id,
      })
    )

    const result = await sut.execute({
      date: new Date(2024, 3),
      providerId: provider.id.toValue(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.dates.length).toBe(5)
    }
  })
})
