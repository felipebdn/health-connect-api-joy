import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

export interface AppointmentProps {
  providerId: UniqueEntityId
  eventId: UniqueEntityId
  name: string
  email: string
  cpf: string
  phone: string
  description: string | null
}

export class Appointment extends Entity<AppointmentProps> {
  get providerId() {
    return this.props.providerId
  }

  get eventId() {
    return this.props.eventId
  }

  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get cpf() {
    return this.props.cpf
  }

  get phone() {
    return this.props.phone
  }

  get description() {
    return this.props.description
  }

  static create(props: AppointmentProps, id?: UniqueEntityId) {
    const appointment = new Appointment(props, id)

    return appointment
  }
}
