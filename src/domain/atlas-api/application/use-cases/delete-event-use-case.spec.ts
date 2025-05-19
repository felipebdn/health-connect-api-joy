import { UniqueEntityId } from '@/core/entities/unique-entity-id'

import { DeleteEventUseCase } from './delete-event-use-case'
import { makeEvent } from '@test/factories/make-events'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointment-repository'
import { InMemoryEventRepository } from '@test/repositories/in-memory-events-repository'

let inMemoryEventRepository: InMemoryEventRepository
let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let sut: DeleteEventUseCase

describe('Change Duration Provider', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryEventRepository = new InMemoryEventRepository()

    sut = new DeleteEventUseCase(
      inMemoryAppointmentRepository,
      inMemoryEventRepository
    )
  })

  it('should be able to delete event edited', async () => {
    const recurrence = makeEvent(
      {
        startTime: new Date(2024, 1, 9, 7, 30),
        endTime: new Date(2024, 1, 9, 8, 30),
        startTimezone: 'America/Sao_Paulo',
        endTimezone: 'America/Sao_Paulo',
        providerId: new UniqueEntityId('provider-01'),
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=FR;INTERVAL=1',
        title: 'availability',
        recurrenceException: '2024-02-16T07:30:00.000Z',
      },
      new UniqueEntityId('event-01')
    )
    const event = makeEvent(
      {
        startTime: new Date(2024, 1, 16, 7, 30),
        endTime: new Date(2024, 1, 16, 8, 30),
        startTimezone: 'America/Sao_Paulo',
        endTimezone: 'America/Sao_Paulo',
        providerId: new UniqueEntityId('provider-01'),
        title: 'availability',
        recurrenceID: recurrence.id,
      },
      new UniqueEntityId('event-02')
    )
    inMemoryEventRepository.items.push(recurrence, event)

    const result = await sut.execute({
      eventId: event.id.toValue(),
      type: 'event',
    })

    expect(result.isRight()).toBeTruthy()

    expect(inMemoryEventRepository.items.length).toBe(1)
  })
  it('should be able to delete recurrence event was edited', async () => {
    const recurrence = makeEvent(
      {
        startTime: new Date(2024, 1, 9, 7, 30),
        endTime: new Date(2024, 1, 9, 8, 30),
        startTimezone: 'America/Sao_Paulo',
        endTimezone: 'America/Sao_Paulo',
        providerId: new UniqueEntityId('provider-01'),
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=FR;INTERVAL=1',
        title: 'availability',
        recurrenceException: '2024-02-16T07:30:00.000Z',
      },
      new UniqueEntityId('event-01')
    )
    const event = makeEvent(
      {
        startTime: new Date(2024, 1, 16, 7, 30),
        endTime: new Date(2024, 1, 16, 8, 30),
        startTimezone: 'America/Sao_Paulo',
        endTimezone: 'America/Sao_Paulo',
        providerId: new UniqueEntityId('provider-01'),
        title: 'availability',
        recurrenceID: recurrence.id,
      },
      new UniqueEntityId('event-02')
    )
    inMemoryEventRepository.items.push(recurrence, event)

    const result = await sut.execute({
      eventId: recurrence.id.toValue(),
      type: 'recurrence',
    })

    expect(result.isRight()).toBeTruthy()

    expect(inMemoryEventRepository.items.length).toBe(1)
    expect(inMemoryEventRepository.items.at(0)?.recurrenceID).toBeUndefined()
  })
  it('should be able to exclude a day from a recurrence', async () => {
    const recurrence = makeEvent(
      {
        startTime: new Date(2024, 1, 9, 7, 30),
        endTime: new Date(2024, 1, 9, 8, 30),
        startTimezone: 'America/Sao_Paulo',
        endTimezone: 'America/Sao_Paulo',
        providerId: new UniqueEntityId('provider-01'),
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=FR;INTERVAL=1',
        title: 'availability',
      },
      new UniqueEntityId('event-01')
    )

    inMemoryEventRepository.items.push(recurrence)

    const result = await sut.execute({
      eventId: recurrence.id.toValue(),
      type: 'recurrence',
      date: new Date(2024, 1, 16),
    })

    expect(result.isRight()).toBeTruthy()

    expect(inMemoryEventRepository.items.length).toBe(1)
    expect(
      inMemoryEventRepository.items.at(0)?.recurrenceException
    ).toBeTruthy()
  })
})
