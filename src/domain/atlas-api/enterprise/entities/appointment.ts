import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export interface AppointmentProps {
  providerId: UniqueEntityId
  eventId: UniqueEntityId
  institutionId: UniqueEntityId
  patientId: UniqueEntityId
  description: string | null
  createdAt: Date
}

export class Appointment extends Entity<AppointmentProps> {
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

    return appointment
  }
}
