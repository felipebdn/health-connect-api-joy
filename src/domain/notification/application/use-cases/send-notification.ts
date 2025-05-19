import { right, type Either } from '@/core/either'
import { Notification } from '../../enterprise/entities/notification'
import type { NotificationsRepository } from '../repositories/notifications-repository'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

export interface MakeNotificationUseCaseRequest {
  recipientId: string
  title: string
  content: string
  typeNotification: 'MAKE_RATING' | 'APPOINTMENT_ALERT'
  typeUser: 'INSTITUTION' | 'PATIENT' | 'PROVIDER'
}

export type MakeNotificationUseCaseResponse = Either<
  null,
  {
    notification: Notification
  }
>

export class MakeNotificationUseCase {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({
    recipientId,
    title,
    content,
    typeNotification,
    typeUser,
  }: MakeNotificationUseCaseRequest): Promise<MakeNotificationUseCaseResponse> {
    const notification = Notification.create({
      recipientId: new UniqueEntityId(recipientId),
      title,
      typeNotification,
      typeUser,
      content,
    })

    await this.notificationsRepository.create(notification)

    return right({
      notification,
    })
  }
}
