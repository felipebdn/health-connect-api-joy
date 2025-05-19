import type { EventEntity } from '../../enterprise/entities/event'

export interface EventRepository {
  create(event: EventEntity): Promise<void>
  save(event: EventEntity): Promise<void>
  delete(eventId: string): Promise<void>

  createMany(events: EventEntity[]): Promise<void>
  findById(eventId: string): Promise<EventEntity | null>
  findManyEventsAvailable(providerId: string): Promise<EventEntity[]>

  getAll(): Promise<EventEntity[]>
}
