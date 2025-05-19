import { AggregateRoot } from '@/core/entities/aggregate-root'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'
import { MakeAppointmentEvent } from '../events/make-appointment-event'

export interface AppointmentProps {
  providerId: UniqueEntityId
  eventId: UniqueEntityId
  institutionId?: UniqueEntityId
  patientId: UniqueEntityId
  description: string | null
  createdAt: Date
}

export class Appointment extends AggregateRoot<AppointmentProps> {
  get providerId() {
    return this.props.providerId
  }

  get eventId() {
    return this.props.eventId
  }

  get institutionId() {
    return this.props.institutionId
  }

  get createdAt() {
    return this.props.createdAt
  }

  get patientId() {
    return this.props.patientId
  }

  get description() {
    return this.props.description
  }

  static create(
    props: Optional<AppointmentProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const appointment = new Appointment(
      { ...props, createdAt: props.createdAt ?? new Date() },
      id
    )

    const isNewAppointment = !id

    if (isNewAppointment) {
      appointment.addDomainEvent(new MakeAppointmentEvent(appointment))
    }

    return appointment
  }
}
