import type { EventRepository } from '@/domain/atlas-api/application/repositories/recurrence-repository'
import type { EventEntity } from '@/domain/atlas-api/enterprise/entities/event'
import { PrismaEventMapper } from '../mappers/prisma-event-mapper'
import type { Appointment } from '@/domain/atlas-api/enterprise/entities/appointment'
import { PrismaAppointmentMapper } from '../mappers/prisma-appointment-mapper'
import type { PrismaClient } from '@prisma/client'

export class PrismaEventRepository implements EventRepository {
  constructor(private prisma: PrismaClient) {}
  async create(event: EventEntity) {
    await this.prisma.event.create({
      data: PrismaEventMapper.toPrisma(event),
    })
  }

  async save(event: EventEntity): Promise<void> {
    await this.prisma.event.update({
      data: PrismaEventMapper.toPrisma(event),
      where: {
        id: event.id.toValue(),
      },
    })
  }

  async delete(eventId: string): Promise<void> {
    await this.prisma.event.delete({
      where: {
        id: eventId,
      },
    })
  }

  async findManyByProviderId(providerId: string): Promise<EventEntity[]> {
    const events = await this.prisma.event.findMany({
      where: {
        providerId,
      },
    })

    return events.map(PrismaEventMapper.toDomain)
  }

  async createMany(events: EventEntity[]): Promise<void> {
    await this.prisma.event.createMany({
      data: events.map(PrismaEventMapper.toPrisma),
    })
  }

  async findById(eventId: string): Promise<EventEntity | null> {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })
    return event ? PrismaEventMapper.toDomain(event) : null
  }

  async findManyEventsAvailable(providerId: string): Promise<EventEntity[]> {
    const events = await this.prisma.event.findMany({
      where: {
        providerId,
        title: 'availability',
      },
    })
    return events.map(PrismaEventMapper.toDomain)
  }

  async findManyEventsUnavailable(
    providerId: string
  ): Promise<{ event: EventEntity; appointment: Appointment }[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        providerId,
      },
      include: {
        event: true,
      },
    })
    return appointments.map((item) => ({
      event: PrismaEventMapper.toDomain(item.event),
      appointment: PrismaAppointmentMapper.toDomain(item),
    }))
  }
}
