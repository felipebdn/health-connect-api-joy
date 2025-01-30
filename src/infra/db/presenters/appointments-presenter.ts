import type { Appointment } from '@/domain/atlas-api/enterprise/entities/appointment'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class AppointmentPresenter {
  static toHTTP(appointment: Appointment) {
    return {
      id: appointment.id.toString(),
      providerId: appointment.providerId.toString(),
      eventId: appointment.eventId.toString(),
      institutionId: appointment.institutionId.toString(),
      patientId: appointment.patientId.toString(),
      description: appointment.description ?? undefined,
      createdAt: appointment.createdAt,
    }
  }
}
