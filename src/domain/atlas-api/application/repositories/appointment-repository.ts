import type { Appointment } from '../../enterprise/entities/appointment'

export interface AppointmentRepository {
  create(appointment: Appointment): Promise<void>
  save(appointment: Appointment): Promise<void>
  delete(appointmentId: string): Promise<void>

  findById(appointmentId: string): Promise<Appointment | null>
  findByEventId(eventId: string): Promise<Appointment | null>
  findManyByProviderId(providerId: string): Promise<Appointment[]>
}
