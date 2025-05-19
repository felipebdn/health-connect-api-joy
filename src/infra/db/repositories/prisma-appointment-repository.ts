import type { AppointmentRepository } from '@/domain/atlas-api/application/repositories/appointment-repository'
import { PrismaAppointmentMapper } from '../mappers/prisma-appointment-mapper'
import type { Appointment } from '@/domain/atlas-api/enterprise/entities/appointment'
import type { PrismaClient } from '@prisma/client'

export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany()
    return appointments.map(PrismaAppointmentMapper.toDomain)
  }

  async create(appointment: Appointment): Promise<void> {
    await this.prisma.appointment.create({
      data: PrismaAppointmentMapper.toPrisma(appointment),
    })
  }

  async save(appointment: Appointment): Promise<void> {
    await this.prisma.appointment.update({
      data: PrismaAppointmentMapper.toPrisma(appointment),
      where: {
        id: appointment.id.toValue(),
      },
    })
  }

  async delete(appointmentId: string): Promise<void> {
    await this.prisma.appointment.delete({
      where: {
        id: appointmentId,
      },
    })
  }

  async findById(appointmentId: string): Promise<Appointment | null> {
    const appointment = await this.prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
    })
    return appointment ? PrismaAppointmentMapper.toDomain(appointment) : null
  }

  async findByEventId(eventId: string): Promise<Appointment | null> {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        eventId,
      },
    })
    return appointment ? PrismaAppointmentMapper.toDomain(appointment) : null
  }

  async findManyByProviderId(providerId: string): Promise<Appointment[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        providerId,
      },
    })

    return appointments.map(PrismaAppointmentMapper.toDomain)
  }
}
