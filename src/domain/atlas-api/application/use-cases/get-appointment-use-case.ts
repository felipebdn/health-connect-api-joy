import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { EventEntity } from '../../enterprise/entities/event'
import type { AppointmentRepository } from '../repositories/appointment-repository'
import type { EventRepository } from '../repositories/recurrence-repository'

interface GetAppointmentUseCaseRequest {
  eventId: string
}

type GetAppointmentUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    appointment: Appointment
    event: EventEntity
  }
>

export class GetAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private eventRepository: EventRepository
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

    return right({ appointment, event })
  }
}
