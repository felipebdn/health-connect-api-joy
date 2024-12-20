import type { Appointment } from "@/domain/atlas-api/enterprise/entities/appointment";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class AppointmentPresenter {
  static toHTTP(appointment: Appointment) {
    return {
      id: appointment.id.toString(),
      providerId: appointment.providerId.toString(),
      eventId: appointment.eventId.toString(),
      name: appointment.name,
      email: appointment.email,
      cpf: appointment.cpf,
      phone: appointment.phone,
      description: appointment.description,
    }
  }
}
