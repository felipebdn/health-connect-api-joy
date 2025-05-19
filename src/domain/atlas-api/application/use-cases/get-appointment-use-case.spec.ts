import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { GetAppointmentUseCase } from './get-appointment-use-case'
import { makeAppointment } from '@test/factories/make-appointment'
import { makeEvent } from '@test/factories/make-events'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointment-repository'
import { InMemoryEventRepository } from '@test/repositories/in-memory-events-repository'
import { InMemoryPatientRepository } from '@test/repositories/in-memory-patient-repository'
import { makePatient } from '@test/factories/make-patient'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryEventRepository: InMemoryEventRepository
let inMemoryPatientRepository: InMemoryPatientRepository
let sut: GetAppointmentUseCase

describe('Get Appointment', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryPatientRepository = new InMemoryPatientRepository()
    inMemoryEventRepository = new InMemoryEventRepository()

    sut = new GetAppointmentUseCase(
      inMemoryAppointmentRepository,
      inMemoryEventRepository,
      inMemoryPatientRepository
    )
  })

  it('should be able to get appointment by appointmentId', async () => {
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
    const result = await sut.execute({
      eventId: event.id.toValue(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.appointment).toBeTruthy()
      expect(result.value.event).toBeTruthy()
    }
  })

  it('should be not able to get appointment, not found ', async () => {
    const result = await sut.execute({
      eventId: 'appointment-01',
    })

    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })
})
