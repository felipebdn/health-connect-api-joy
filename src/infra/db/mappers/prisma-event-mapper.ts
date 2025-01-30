import type { Event as PrismaEvent, Prisma } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { EventEntity } from '@/domain/atlas-api/enterprise/entities/event'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PrismaEventMapper {
  static toDomain(raw: PrismaEvent): EventEntity {
    return EventEntity.create(
      {
        endTime: raw.endTime,
        institutionId: new UniqueEntityId(raw.institutionId),
        endTimezone: raw.endTimezone,
        providerId: new UniqueEntityId(raw.providerId),
        startTime: raw.startTime,
        startTimezone: raw.startTimezone,
        title: raw.title,
        recurrenceException: raw.recurrenceException ?? undefined,
        recurrenceRule: raw.recurrenceRule ?? undefined,
        recurrenceID: raw.recurrenceID
          ? new UniqueEntityId(raw.recurrenceID)
          : undefined,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(event: EventEntity): Prisma.EventUncheckedCreateInput {
    return {
      id: event.id.toValue(),
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      startTimezone: event.startTimezone,
      endTimezone: event.endTimezone,
      providerId: event.providerId.toValue(),
      recurrenceException: event.recurrenceException,
      recurrenceID: event.recurrenceID?.toValue(),
      recurrenceRule: event.recurrenceRule,
      institutionId: event.institutionId.toValue(),
    }
  }
}
