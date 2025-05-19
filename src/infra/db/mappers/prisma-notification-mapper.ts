import type { Notification as PrismaNotification, Prisma } from '@prisma/client'
import { Notification } from '@/domain/notification/enterprise/entities/notification'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PrismaNotificationMapper {
  static toDomain(raw: PrismaNotification): Notification {
    return Notification.create(
      {
        title: raw.title,
        content: raw.content,
        recipientId: new UniqueEntityId(raw.recipientId),
        readAt: raw.readAt,
        typeNotification: raw.typeNotification,
        createdAt: raw.createdAt,
        typeUser: raw.typeUser,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(
    notification: Notification
  ): Prisma.NotificationUncheckedCreateInput {
    return {
      id: notification.id.toString(),
      typeUser: notification.typeUser,
      recipientId: notification.recipientId.toString(),
      title: notification.title,
      typeNotification: notification.typeNotification,
      content: notification.content,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    }
  }
}
