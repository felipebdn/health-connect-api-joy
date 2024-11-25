import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  type EventProps,
  EventEntity,
} from '@/domain/atlas-api/enterprise/entities/event'
import { db } from '@/infra/db/connection'
import { DrizzleEventMapper } from '@/infra/db/mappers/drizzle-event-mapper'
import { EventDb } from '@/infra/db/schema'

export function makeEvent(override?: Partial<EventProps>, id?: UniqueEntityId) {
  const event = EventEntity.create(
    {
      endTime: new Date(),
      startTime: new Date(),
      providerId: new UniqueEntityId(),
      endTimezone: 'America/Sao_Paulo',
      startTimezone: 'America/Sao_Paulo',
      title: 'availability',
      ...override,
    },
    id
  )

  return event
}

export class EventFactory {
  async makePrismaEvent(data: Partial<EventProps>, id?: UniqueEntityId) {
    const eventCreated = makeEvent(data, id)
    await db.insert(EventDb).values(DrizzleEventMapper.toDrizzle(eventCreated))

    return eventCreated
  }
}
