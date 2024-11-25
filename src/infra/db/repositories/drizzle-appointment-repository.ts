import { and, eq, type SQLWrapper } from 'drizzle-orm'
import { db } from '../connection'
import type { AppointmentRepository } from '@/domain/atlas-api/application/repositories/appointment-repository'
import type { Appointment } from '@/domain/atlas-api/enterprise/entities/appointment'
import { AppointmentDb } from '../schema'
import { DrizzleAppointmentMapper } from '../mappers/drizzle-appointment-mapper'

export class DrizzleAppointmentRepository implements AppointmentRepository {
  async create(appointment: Appointment): Promise<void> {
    await db
      .insert(AppointmentDb)
      .values(DrizzleAppointmentMapper.toDrizzle(appointment))
  }
  async save(appointment: Appointment): Promise<void> {
    await db
      .update(AppointmentDb)
      .set(DrizzleAppointmentMapper.toDrizzle(appointment))
  }
  async delete(appointmentId: string): Promise<void> {
    await db.delete(AppointmentDb).where(eq(AppointmentDb.id, appointmentId))
  }
  async findById(appointmentId: string): Promise<Appointment | null> {
    const appointment = await db.query.AppointmentDb.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, appointmentId)
      },
    })
    if (!appointment) {
      return null
    }
    return DrizzleAppointmentMapper.toDomain(appointment)
  }
  async findByEventId(eventId: string): Promise<Appointment | null> {
    const appointment = await db.query.AppointmentDb.findFirst({
      where(fields, { eq }) {
        return eq(fields.eventId, eventId)
      },
    })
    if (!appointment) {
      return null
    }
    return DrizzleAppointmentMapper.toDomain(appointment)
  }
  async findManyByProviderId(providerId: string): Promise<Appointment[]> {
    const appointments = await db.query.AppointmentDb.findMany({
      where(fields, { eq }) {
        return eq(fields.providerId, providerId)
      },
    })
    return appointments.map((appointment) =>
      DrizzleAppointmentMapper.toDomain(appointment)
    )
  }
  async findByEmailOrCPF(data: { email?: string; cpf?: string }): Promise<
    Appointment[]
  > {
    const conditions: SQLWrapper[] = []

    if (data.email) {
      conditions.push(eq(AppointmentDb.email, data.email))
    }
    if (data.cpf) {
      conditions.push(eq(AppointmentDb.cpf, data.cpf))
    }

    const appointments = await db
      .select()
      .from(AppointmentDb)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
    return appointments.map((appointment) =>
      DrizzleAppointmentMapper.toDomain(appointment)
    )
  }
}
