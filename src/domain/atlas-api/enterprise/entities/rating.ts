import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export interface RatingProps {
  providerId: UniqueEntityId
  appointmentId: UniqueEntityId
  patientId: UniqueEntityId
  name: string
  rating: number
  description?: string
  createdAt: Date
}

export class Rating extends Entity<RatingProps> {
  get providerId() {
    return this.props.providerId
  }

  get name() {
    return this.props.name
  }

  get appointmentId() {
    return this.props.appointmentId
  }

  get patientId() {
    return this.props.patientId
  }

  get rating() {
    return this.props.rating
  }

  get description() {
    return this.props.description
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<RatingProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const rating = new Rating({ ...props, createdAt: new Date() }, id)
    return rating
  }
}
