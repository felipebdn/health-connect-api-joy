import { makeProvider } from '@test/factories/make-provider'
import { InMemoryEventRepository } from '@test/repositories/in-memory-events-repository'
import { InMemoryProviderRepository } from '@test/repositories/in-memory-provider-repository'
import { InMemoryAppointmentRepository } from '@test/repositories/in-memory-appointment-repository'
import { InMemoryRatingRepository } from '@test/repositories/in-memory-rating-repository'
import { MakeRatingUseCase } from './make-rating-use-case'
import { makeAppointment } from '@test/factories/make-appointment'
import { makeEvent } from '@test/factories/make-events'
import { InMemoryPatientRepository } from '@test/repositories/in-memory-patient-repository'
import { makePatient } from '@test/factories/make-patient'

let inMemoryEventRepository: InMemoryEventRepository
let inMemoryProviderRepository: InMemoryProviderRepository
let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let inMemoryPatientRepository: InMemoryPatientRepository
let inMemoryRatingRepository: InMemoryRatingRepository
let sut: MakeRatingUseCase

describe('Make rating a provider', () => {
  beforeEach(() => {
    inMemoryEventRepository = new InMemoryEventRepository()
    inMemoryProviderRepository = new InMemoryProviderRepository()
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()
    inMemoryPatientRepository = new InMemoryPatientRepository()
    inMemoryRatingRepository = new InMemoryRatingRepository()

    sut = new MakeRatingUseCase(
      inMemoryProviderRepository,
      inMemoryAppointmentRepository,
      inMemoryPatientRepository,
      inMemoryRatingRepository
    )
  })

  it('should be able to make rating a provider', async () => {
    const provider = makeProvider()
    inMemoryProviderRepository.items.push(provider)

    const event = makeEvent({ providerId: provider.id, title: 'appointment' })
    inMemoryEventRepository.items.push(event)

    const patient = makePatient()
    inMemoryPatientRepository.items.push(patient)

    const appointment = makeAppointment({
      eventId: event.id,
      patientId: patient.id,
      providerId: provider.id,
    })
    inMemoryAppointmentRepository.items.push(appointment)

    const result = await sut.execute({
      appointmentId: appointment.id.toString(),
      description: '',
      providerId: provider.id.toString(),
      rating: 5,
      patientId: patient.id.toString(),
    })

    expect(result?.isRight()).toBeTruthy()
  })
})
