import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { NotificationProps } from '@/domain/notification/enterprise/entities/notification'
import { PrismaNotificationMapper } from '@/infra/db/mappers/prisma-notification-mapper'
import { getPrismaClient } from '@/infra/db/prisma'
import { faker } from '@faker-js/faker'
import { Notification } from '@/domain/notification/enterprise/entities/notification'

export function makeNotification(
  override: Partial<NotificationProps> = {},
  id?: UniqueEntityId
) {
  const notification = Notification.create(
    {
      recipientId: new UniqueEntityId(),
      title: faker.lorem.sentence(4),
      content: faker.lorem.sentence(10),
      typeNotification: 'APPOINTMENT_ALERT',
      typeUser: 'PROVIDER',
      ...override,
    },
    id
  )

  return notification
}

export class NotificationFactory {
  async makePrismaNotification(
    data: Partial<NotificationProps> = {}
  ): Promise<Notification> {
    const prisma = getPrismaClient()
    const notification = makeNotification(data)

    await prisma.notification.create({
      data: PrismaNotificationMapper.toPrisma(notification),
    })

    return notification
  }
}
