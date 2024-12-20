import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Appointment } from "@/domain/atlas-api/enterprise/entities/appointment";
import type { Prisma, Appointment as PrismaAppointment } from "@prisma/client";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PrismaAppointmentMapper {
  static toDomain(raw: PrismaAppointment): Appointment {
    return Appointment.create(
      {
        providerId: new UniqueEntityId(raw.providerId),
        eventId: new UniqueEntityId(raw.eventId),
        cpf: raw.cpf,
        email: raw.email,
        name: raw.name,
        phone: raw.phone,
        description: raw.description,
      },
      new UniqueEntityId(raw.id),
    )
  }
  static toPrisma(
    appointment: Appointment,
  ): Prisma.AppointmentUncheckedCreateInput {
    return {
      id: appointment.id.toValue(),
      providerId: appointment.providerId.toValue(),
      eventId: appointment.eventId.toValue(),
      cpf: appointment.cpf,
      email: appointment.email,
      name: appointment.name,
      phone: appointment.phone,
      description: appointment.description,
    }
  }
}
