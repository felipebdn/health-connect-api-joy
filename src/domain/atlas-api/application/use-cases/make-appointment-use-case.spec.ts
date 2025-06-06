import { makeEvent } from '@test/factories/make-events'
import { makeProvider } from '@test/factories/make-provider'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointment-repository'
import { InMemoryEmailService } from '@test/repositories/in-memory-email-service-repository'
import { InMemoryEventRepository } from '@test/repositories/in-memory-events-repository'
import { InMemoryProviderRepository } from '@test/repositories/in-memory-provider-repository'
import { MakeAppointmentUseCase } from './make-appointment-use-case'
import { InMemoryPatientRepository } from '@test/repositories/in-memory-patient-repository'
import { makePatient } from '@test/factories/make-patient'

let inMemoryEmailService: InMemoryEmailService
let inMemoryProviderRepository: InMemoryProviderRepository
let inMemoryEventRepository: InMemoryEventRepository
let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryPatientRepository: InMemoryPatientRepository
let sut: MakeAppointmentUseCase

describe('Make a new Appointment', () => {
  beforeEach(() => {
    inMemoryEmailService = new InMemoryEmailService()
    inMemoryProviderRepository = new InMemoryProviderRepository()
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryPatientRepository = new InMemoryPatientRepository()
    inMemoryEventRepository = new InMemoryEventRepository()

    sut = new MakeAppointmentUseCase(
      inMemoryEventRepository,
      inMemoryAppointmentRepository,
      inMemoryProviderRepository,
      inMemoryPatientRepository,
      inMemoryEmailService
    )
  })

  it('should be able to make a new appointment from an event', async () => {
    const provider = makeProvider()
    inMemoryProviderRepository.items.push(provider)

    const event = makeEvent({
      providerId: provider.id,
    })
    inMemoryEventRepository.items.push(event)

    const patient = makePatient({})
    inMemoryPatientRepository.items.push(patient)

    const result = await sut.execute({
      eventId: event.id.toValue(),
      providerId: provider.id.toString(),
      patientId: patient.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryEventRepository.items.length).toBe(1)
    expect(inMemoryAppointmentRepository.items.length).toBe(1)
    if (result.isRight()) {
      expect(result.value.appointment.id.toValue()).toBeTruthy()
    }
  })

  it('must be able to schedule a new appointment from a recurrence', async () => {
    const provider = makeProvider()
    inMemoryProviderRepository.items.push(provider)

    const event = makeEvent({
      providerId: provider.id,
      recurrenceRule: 'teste',
    })
    inMemoryEventRepository.items.push(event)

    const patient = makePatient({})
    inMemoryPatientRepository.items.push(patient)

    const result = await sut.execute({
      providerId: provider.id.toString(),
      date: new Date(),
      patientId: patient.id.toString(),
      eventId: event.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryEventRepository.items.length).toBe(2)
    expect(inMemoryAppointmentRepository.items.length).toBe(1)
    if (result.isRight()) {
      expect(result.value.appointment.id.toValue()).toBeTruthy()
    }
  })
  it('must be able to make a new appointment from an edited event of a recurrence', async () => {
    const provider = makeProvider()
    inMemoryProviderRepository.items.push(provider)

    const recurrence = makeEvent({
      providerId: provider.id,
      recurrenceRule: 'teste',
    })

    const event = makeEvent({
      providerId: provider.id,
      recurrenceRule: 'teste',
      recurrenceID: recurrence.id,
    })

    inMemoryEventRepository.items.push(event, recurrence)

    const patient = makePatient({})
    inMemoryPatientRepository.items.push(patient)

    const result = await sut.execute({
      eventId: event.id.toValue(),
      providerId: provider.id.toString(),
      date: new Date(),
      patientId: patient.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryEventRepository.items.length).toBe(2)
    expect(inMemoryAppointmentRepository.items.length).toBe(1)
    if (result.isRight()) {
      expect(result.value.appointment.id.toValue()).toBeTruthy()
    }
  })
})
