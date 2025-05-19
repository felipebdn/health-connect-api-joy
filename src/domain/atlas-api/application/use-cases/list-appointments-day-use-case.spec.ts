import { makeAppointment } from '@test/factories/make-appointment'
import { makeEvent } from '@test/factories/make-events'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointment-repository'
import { InMemoryEventRepository } from '@test/repositories/in-memory-events-repository'
import { InMemoryPatientRepository } from '@test/repositories/in-memory-patient-repository'
import { makePatient } from '@test/factories/make-patient'
import { ListAppointmentsDayUseCase } from './list-appointments-day-use-case'
import { InMemoryAppointmentEventPatientRepository } from '@test/repositories/in-memory-appointment-event-patient-repository'
import { InMemoryProviderRepository } from '@test/repositories/in-memory-provider-repository'

let inMemoryAppointmentEventPatientRepository: InMemoryAppointmentEventPatientRepository
let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryEventRepository: InMemoryEventRepository
let inMemoryPatientRepository: InMemoryPatientRepository
let inMemoryProviderRepository: InMemoryProviderRepository
let sut: ListAppointmentsDayUseCase

describe('List Appointments', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryEventRepository = new InMemoryEventRepository()
    inMemoryPatientRepository = new InMemoryPatientRepository()
    inMemoryProviderRepository = new InMemoryProviderRepository()

    inMemoryAppointmentEventPatientRepository =
      new InMemoryAppointmentEventPatientRepository(
        inMemoryAppointmentRepository,
        inMemoryEventRepository,
        inMemoryPatientRepository,
        inMemoryProviderRepository
      )

    sut = new ListAppointmentsDayUseCase(
      inMemoryAppointmentEventPatientRepository
    )
  })

  it('should be able to get appointments by day', async () => {
    const event = makeEvent({})
    inMemoryEventRepository.items.push(event)
    const patient = makePatient({})
    inMemoryPatientRepository.items.push(patient)
    const appointment = makeAppointment({
      eventId: event.id,
      patientId: patient.id,
    })
    inMemoryAppointmentRepository.items.push(appointment)

    expect(inMemoryAppointmentRepository.items.length).toBe(1)
    const result = await sut.execute({ day: event.startTime })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.appointments).toBeTruthy()
      expect(result.value.appointments.length).toBe(1)
    }
  })
})
