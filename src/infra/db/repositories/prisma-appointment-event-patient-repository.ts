import type {
  AppointmentEventPatientRepository,
  findManyWithEventAndPatientResponse,
} from '@/domain/atlas-api/application/repositories/appointment-event-patient-repository'
import type { Appointment } from '@/domain/atlas-api/enterprise/entities/appointment'
import type { EventEntity } from '@/domain/atlas-api/enterprise/entities/event'
import type { PrismaClient } from '@prisma/client'
import dayjs from 'dayjs'
import { PrismaAppointmentMapper } from '../mappers/prisma-appointment-mapper'
import { PrismaEventMapper } from '../mappers/prisma-event-mapper'
import { PrismaPatientMapper } from '../mappers/prisma-patient-mapper'
import { PrismaProviderMapper } from '../mappers/prisma-provider-mapper'

export class PrismaAppointmentEventPatientRepository
  implements AppointmentEventPatientRepository
{
  constructor(private prisma: PrismaClient) {}

  async findManyWithEventAndPatient(
    day: Date,
    institutionId: string | undefined
  ): Promise<findManyWithEventAndPatientResponse> {
    const applications = await this.prisma.appointment.findMany({
      include: { event: true, patient: true, provider: true },
      where: {
        event: {
          startTime: {
            gte: dayjs(day).startOf('day').toDate(),
            lt: dayjs(day).endOf('day').toDate(),
          },
          ...(institutionId && { institutionId }),
        },
      },
    })
    return applications.map((item) => {
      const { event, patient, provider, ...appointment } = item
      return {
        appointment: PrismaAppointmentMapper.toDomain(appointment),
        event: PrismaEventMapper.toDomain(event),
        patient: PrismaPatientMapper.toDomain(patient),
        provider: PrismaProviderMapper.toDomain(provider),
      }
    })
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
