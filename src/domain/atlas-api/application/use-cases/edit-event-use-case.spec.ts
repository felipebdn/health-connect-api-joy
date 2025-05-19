import { UniqueEntityId } from '@/core/entities/unique-entity-id'

import { EditEventUseCase } from './edit-event-use-case'
import { makeEvent } from '@test/factories/make-events'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointment-repository'
import { InMemoryEventRepository } from '@test/repositories/in-memory-events-repository'

let inMemoryEventRepository: InMemoryEventRepository
let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let sut: EditEventUseCase

describe('Edit Event', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryEventRepository = new InMemoryEventRepository()

    sut = new EditEventUseCase(inMemoryEventRepository)
  })

  it('should be able to edit a currency event', async () => {
    const recurrence = makeEvent({
      startTime: new Date(2024, 1, 9, 7, 30), // 10:30
      endTime: new Date(2024, 1, 9, 8, 30), // 11:30
      startTimezone: 'America/Sao_Paulo',
      endTimezone: 'America/Sao_Paulo',
      providerId: new UniqueEntityId('provider-01'),
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=FR;INTERVAL=1',
      title: 'availability',
    })
    inMemoryEventRepository.items.push(recurrence)

    await sut.execute({
      startTime: new Date(2024, 1, 9, 9, 30),
      endTime: new Date(2024, 1, 9, 10, 30),
      startTimezone: 'America/Sao_Paulo',
      endTimezone: 'America/Sao_Paulo',
      eventId: recurrence.id.toValue(),
      type: 'event',
      currentStartTime: new Date(2024, 1, 9, 7, 30),
    })

    expect(inMemoryEventRepository.items.length).toBe(2)

    expect(
      inMemoryEventRepository.items.at(1)?.recurrenceID?.toString()
    ).toEqual(recurrence.id.toString())
  })
  it('should be able to edit the entire recurrence', async () => {
    const recurrence = makeEvent({
      startTime: new Date(2024, 1, 9, 7, 30), // 10:30
      endTime: new Date(2024, 1, 9, 8, 30), // 13:10
      startTimezone: 'America/Sao_Paulo',
      endTimezone: 'America/Sao_Paulo',
      providerId: new UniqueEntityId('provider-01'),
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=FR;INTERVAL=1',
      title: 'availability',
    })
    inMemoryEventRepository.items.push(recurrence)

    await sut.execute({
      startTime: new Date(2024, 1, 9, 9, 30),
      endTime: new Date(2024, 1, 9, 10, 30),
      startTimezone: 'America/Sao_Paulo',
      endTimezone: 'America/Sao_Paulo',
      eventId: recurrence.id.toValue(),
      type: 'recurrence',
    })

    expect(inMemoryEventRepository.items.length).toBe(1)
  })
})
