import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { AppointmentRepository } from '../repositories/appointment-repository'
import type { EventRepository } from '../repositories/recurrence-repository'
import type { NotAvailableScheduling } from './errors/not-available-scheduling'

interface DeleteEventUseCaseRequest {
  eventId: string
  type: 'event' | 'recurrence'
  date?: Date
}

type DeleteEventUseCaseResponse = Either<
  ResourceNotFoundError | NotAvailableScheduling,
  unknown
>

export class DeleteEventUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private eventRepository: EventRepository
  ) {}

  async execute(
    props: DeleteEventUseCaseRequest
  ): Promise<DeleteEventUseCaseResponse> {
    const event = await this.eventRepository.findById(props.eventId)
    if (!event) {
      return left(new ResourceNotFoundError('event'))
    }

    if (event.title === 'appointment') {
      const appointment = await this.appointmentRepository.findByEventId(
        event.id.toValue()
      )

      if (!appointment) {
        return left(new ResourceNotFoundError('appointment'))
      }

      event.title = 'availability'
      await this.eventRepository.save(event)
      await this.appointmentRepository.delete(appointment.id.toString())
      return right({})
    }
    if (props.type === 'event' && event.title === 'availability') {
      await this.eventRepository.delete(event.id.toValue())
      return right({})
    }
    if (props.date) {
      event.recurrenceException = props.date
      await this.eventRepository.save(event)
      return right({})
    }
    await this.eventRepository.delete(event.id.toValue())
    return right({})
  }
}
