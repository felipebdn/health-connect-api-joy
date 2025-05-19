import { makeAppointment } from '@test/factories/make-appointment'
import { makeEvent } from '@test/factories/make-events'
import { makeProvider } from '@test/factories/make-provider'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointment-repository'
import { InMemoryEventRepository } from '@test/repositories/in-memory-events-repository'
import { InMemoryProviderRepository } from '@test/repositories/in-memory-provider-repository'
import { ListEventsProviderUseCase } from './list-events-provider-use-case'
import { InMemoryAppointmentEventPatientRepository } from '@test/repositories/in-memory-appointment-event-patient-repository'
import { InMemoryPatientRepository } from '@test/repositories/in-memory-patient-repository'

let inMemoryProviderRepository: InMemoryProviderRepository
let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryEventRepository: InMemoryEventRepository
let inMemoryPatientRepository: InMemoryPatientRepository
let inMemoryAppointmentEventPatientRepository: InMemoryAppointmentEventPatientRepository
let sut: ListEventsProviderUseCase

describe('List Schedules Month', () => {
  beforeEach(() => {
    inMemoryProviderRepository = new InMemoryProviderRepository()
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryEventRepository = new InMemoryEventRepository()
    inMemoryPatientRepository = new InMemoryPatientRepository()
    inMemoryAppointmentEventPatientRepository =
      new InMemoryAppointmentEventPatientRepository(
        inMemoryAppointmentRepository,
        inMemoryEventRepository,
        inMemoryPatientRepository,
        inMemoryProviderRepository
      )

    sut = new ListEventsProviderUseCase(
      inMemoryProviderRepository,
      inMemoryEventRepository,
      inMemoryAppointmentEventPatientRepository
    )
  })

  it('should be able to fetch schedules available for months', async () => {
    const provider = makeProvider()
    inMemoryProviderRepository.items.push(provider)

    const event1 = makeEvent({
      title: 'appointment',
      providerId: provider.id,
      startTime: new Date(2024, 1, 10, 11, 30),
      endTime: new Date(2024, 1, 10, 12, 30),
    })
    const event2 = makeEvent({
      title: 'availability',
      providerId: provider.id,
      startTime: new Date(2024, 1, 10, 12, 30),
      endTime: new Date(2024, 1, 10, 13, 30),
    })
    const appointment = makeAppointment({
      providerId: provider.id,
      eventId: event1.id,
    })

    inMemoryAppointmentRepository.items.push(appointment)
    inMemoryEventRepository.items.push(
      makeEvent({
        title: 'availability',
        providerId: provider.id,
        startTime: new Date(2024, 1, 10, 10, 30),
        endTime: new Date(2024, 1, 10, 11, 30),
      }),
      event1,
      event2
    )

    const result = await sut.execute({
      providerId: provider.id.toValue(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.events.length).toBe(3)
      expect(
        result.value.events[2].appointment?.id.equals(appointment.id)
      ).toBe(true)
      expect(result.value.events[2].event?.id.equals(event1.id)).toBe(true)
    }
  })
})
