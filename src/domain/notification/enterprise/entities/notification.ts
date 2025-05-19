import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export interface NotificationProps {
  recipientId: UniqueEntityId
  title: string
  content: string
  typeNotification: 'MAKE_RATING' | 'APPOINTMENT_ALERT'
  typeUser: 'INSTITUTION' | 'PATIENT' | 'PROVIDER'
  readAt?: Date | null
  createdAt: Date
}

export class Notification extends Entity<NotificationProps> {
  get recipientId() {
    return this.props.recipientId
  }

  get title() {
    return this.props.title
  }

  get typeUser() {
    return this.props.typeUser
  }

  get typeNotification() {
    return this.props.typeNotification
  }

  get content() {
    return this.props.content
  }

  get readAt() {
    return this.props.readAt
  }

  get createdAt() {
    return this.props.createdAt
  }

  read() {
    this.props.readAt = new Date()
  }

  static create(
    props: Optional<NotificationProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const notification = new Notification(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return notification
  }
}
