import { makeAppointment } from 'tests/factories/make-appointment'
import { makeEvent } from 'tests/factories/make-events'
import { makeProvider } from 'tests/factories/make-provider'
import { InMemoryAppointmentRepository } from 'tests/repositories/in-memory-appointment-repository'
import { InMemoryEventRepository } from 'tests/repositories/in-memory-events-repository'
import { InMemoryProviderRepository } from 'tests/repositories/in-memory-provider-repository'
import { ListAvailabilityDayUseCase } from './list-availability-day-use-case'

let inMemoryEventRepository: InMemoryEventRepository
let inMemoryProviderRepository: InMemoryProviderRepository
let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let sut: ListAvailabilityDayUseCase

describe('List availability of day', () => {
  beforeEach(() => {
    inMemoryProviderRepository = new InMemoryProviderRepository()
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryEventRepository = new InMemoryEventRepository(
      inMemoryAppointmentRepository
    )

    sut = new ListAvailabilityDayUseCase(
      inMemoryEventRepository,
      inMemoryProviderRepository
    )

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to list days on availability by day', async () => {
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
      startTime: new Date(2024, 2, 19, 11, 30),
      endTime: new Date(2024, 2, 19, 12, 30),
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
      startTime: new Date(2024, 3, 6, 12, 30),
      endTime: new Date(2024, 3, 6, 13, 30),
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

    const result1 = await sut.execute({
      date: new Date(2024, 2, 19),
      providerId: provider.id.toValue(),
    })

    expect(result1.isRight()).toBe(true)
    if (result1.isRight()) {
      expect(result1.value.schedules.length).toBe(2)
    }

    const result2 = await sut.execute({
      date: new Date(2024, 2, 28),
      providerId: provider.id.toValue(),
    })

    expect(result2.isRight()).toBe(true)
    if (result2.isRight()) {
      expect(result2.value.schedules.length).toBe(1)
    }
  })
})
