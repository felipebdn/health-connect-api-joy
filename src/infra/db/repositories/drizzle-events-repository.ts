import { eq } from 'drizzle-orm'
import { db } from '../connection'
import type { EventRepository } from '@/domain/atlas-api/application/repositories/recurrence-repository'
import type { Appointment } from '@/domain/atlas-api/enterprise/entities/appointment'
import type { EventEntity } from '@/domain/atlas-api/enterprise/entities/event'
import { AppointmentDb, EventDb } from '../schema'
import { DrizzleEventMapper } from '../mappers/drizzle-event-mapper'
import { DrizzleAppointmentMapper } from '../mappers/drizzle-appointment-mapper'

export class DrizzleEventRepository implements EventRepository {
  async create(event: EventEntity): Promise<void> {
    await db.insert(EventDb).values(DrizzleEventMapper.toDrizzle(event))
  }
  async save(event: EventEntity): Promise<void> {
    await db.update(EventDb).set(DrizzleEventMapper.toDrizzle(event))
  }
  async delete(eventId: string): Promise<void> {
    await db.delete(EventDb).where(eq(EventDb.id, eventId))
  }
  async createMany(events: EventEntity[]): Promise<void> {
    await db
      .insert(EventDb)
      .values(events.map((event) => DrizzleEventMapper.toDrizzle(event)))
  }
  async findById(eventId: string): Promise<EventEntity | null> {
    const event = await db.query.EventDb.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, eventId)
      },
    })
    if (!event) return null
    return DrizzleEventMapper.toDomain(event)
  }
  async findManyEventsAvailable(providerId: string): Promise<EventEntity[]> {
    const events = await db.query.EventDb.findMany({
      where(fields, { and, eq }) {
        return and(
          eq(fields.providerId, providerId),
          eq(fields.title, 'availability')
        )
      },
    })
    return events.map((event) => DrizzleEventMapper.toDomain(event))
  }
  async findManyEventsUnavailable(
    providerId: string
  ): Promise<{ event: EventEntity; appointment: Appointment }[]> {
    const appointments = await db
      .select({
        appointment: AppointmentDb,
        event: EventDb,
      })
      .from(AppointmentDb)
      .where(eq(AppointmentDb.providerId, providerId))
      .innerJoin(EventDb, eq(AppointmentDb.eventId, EventDb.id))

    return appointments.map((item) => ({
      event: DrizzleEventMapper.toDomain(item.event),
      appointment: DrizzleAppointmentMapper.toDomain(item.appointment),
    }))
  }
}
