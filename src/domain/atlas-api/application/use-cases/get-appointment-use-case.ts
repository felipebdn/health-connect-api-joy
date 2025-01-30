import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { EventEntity } from '../../enterprise/entities/event'
import type { AppointmentRepository } from '../repositories/appointment-repository'
import type { EventRepository } from '../repositories/recurrence-repository'
import type { PatientRepository } from '../repositories/patient-repository'
import type { Patient } from '../../enterprise/entities/patient'

interface GetAppointmentUseCaseRequest {
  eventId: string
}

type GetAppointmentUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    appointment: Appointment
    event: EventEntity
    patient: Patient
  }
>

export class GetAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private eventRepository: EventRepository,
    private patientRepository: PatientRepository
  ) {}

  async execute({
    eventId,
  }: GetAppointmentUseCaseRequest): Promise<GetAppointmentUseCaseResponse> {
    const appointment = await this.appointmentRepository.findByEventId(eventId)

    if (!appointment) {
      return left(new ResourceNotFoundError('appointment'))
    }

    const event = await this.eventRepository.findById(
      appointment.eventId.toValue()
    )

    if (!event) {
      return left(new ResourceNotFoundError('event'))
    }

    const patient = await this.patientRepository.findById(
      appointment.patientId.toValue()
    )

    if (!patient) {
      return left(new ResourceNotFoundError('event'))
    }

    return right({ appointment, event, patient })
  }
}
