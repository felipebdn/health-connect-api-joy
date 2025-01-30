import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  type EventProps,
  EventEntity,
} from '@/domain/atlas-api/enterprise/entities/event'
import { PrismaEventMapper } from '@/infra/db/mappers/prisma-event-mapper'
import { getPrismaClient } from '@/infra/db/prisma'

export function makeEvent(override?: Partial<EventProps>, id?: UniqueEntityId) {
  const event = EventEntity.create(
    {
      endTime: new Date(),
      startTime: new Date(),
      providerId: new UniqueEntityId(),
      endTimezone: 'America/Sao_Paulo',
      startTimezone: 'America/Sao_Paulo',
      title: 'availability',
      institutionId: new UniqueEntityId(),
      ...override,
    },
    id
  )

  return event
}

export class EventFactory {
  async makePrismaEvent(data: Partial<EventProps>, id?: UniqueEntityId) {
    const prisma = getPrismaClient()
    const eventCreated = makeEvent(data, id)
    await prisma.event.create({
      data: PrismaEventMapper.toPrisma(eventCreated),
    })
    return eventCreated
  }
}
