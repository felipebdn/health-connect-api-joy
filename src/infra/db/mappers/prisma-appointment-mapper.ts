import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Appointment } from '@/domain/atlas-api/enterprise/entities/appointment'
import type { Prisma, Appointment as PrismaAppointment } from '@prisma/client'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PrismaAppointmentMapper {
  static toDomain(raw: PrismaAppointment): Appointment {
    return Appointment.create(
      {
        providerId: new UniqueEntityId(raw.providerId),
        eventId: new UniqueEntityId(raw.eventId),
        description: raw.description,
        institutionId: new UniqueEntityId(raw.institutionId),
        patientId: new UniqueEntityId(raw.patientId),
      },
      new UniqueEntityId(raw.id)
    )
  }
  static toPrisma(
    appointment: Appointment
  ): Prisma.AppointmentUncheckedCreateInput {
    return {
      id: appointment.id.toValue(),
      providerId: appointment.providerId.toValue(),
      eventId: appointment.eventId.toValue(),
      description: appointment.description,
      institutionId: appointment.institutionId.toValue(),
      patientId: appointment.patientId.toValue(),
    }
  }
}
