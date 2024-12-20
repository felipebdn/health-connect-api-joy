import { makeProvider } from '@test/factories/make-provider'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointment-repository'
import { InMemoryEventRepository } from '@test/repositories/in-memory-events-repository'
import { InMemoryProviderRepository } from '@test/repositories/in-memory-provider-repository'
import { NewEventUseCase } from './new-event-use-case'

let inMemoryProviderRepository: InMemoryProviderRepository
let inMemoryEventRepository: InMemoryEventRepository
let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let sut: NewEventUseCase

describe('New Recurrence', () => {
  beforeEach(() => {
    inMemoryProviderRepository = new InMemoryProviderRepository()
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryEventRepository = new InMemoryEventRepository(
      inMemoryAppointmentRepository
    )

    sut = new NewEventUseCase(
      inMemoryEventRepository,
      inMemoryProviderRepository
    )
  })

  it('should be able to make a new recurrence rule', async () => {
    const provider = makeProvider()
    inMemoryProviderRepository.items.push(provider)

    await sut.execute({
      duration: 60,
      startTime: new Date(2024, 1, 10, 7, 30), // 10:30
      endTime: new Date(2024, 1, 10, 10, 10), // 13:10
      startTimezone: 'America/Sao_Paulo',
      endTimezone: 'America/Sao_Paulo',
      providerId: provider.id.toValue(),
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=TU;INTERVAL=1',
      title: 'availability',
    }) // 10:30-11:30 * 11:30-12:30 * 12:30-13:10(minus of 60 minutes) = 2

    await sut.execute({
      duration: 60,
      startTime: new Date(2024, 1, 10, 10, 30), // 13:30
      endTime: new Date(2024, 1, 10, 15, 10), // 18:10
      startTimezone: 'America/Sao_Paulo',
      endTimezone: 'America/Sao_Paulo',
      providerId: provider.id.toValue(),
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=TU,FR;INTERVAL=2',
      title: 'availability',
    }) // 13:30-14:30 * 14:30-15:30 * 15:30-16:30 * 16:30-17:30 * 17:30-18:10(minus of 60 minutes) = 4

    await sut.execute({
      duration: 60,
      startTime: new Date(2024, 1, 10, 7, 30), // 10:30
      endTime: new Date(2024, 1, 10, 10, 30), // 13:30
      startTimezone: 'America/Sao_Paulo',
      endTimezone: 'America/Sao_Paulo',
      providerId: provider.id.toValue(),
      recurrenceRule: '',
      title: 'availability',
    }) // 10:30-11:30 * 11:30-12:30 * 12:30-13:30 // 3

    expect(inMemoryEventRepository.items.length).toBe(9)
  })
})
