import type { Appointment } from '../entities/appointment'

export class AppointmentConfirmedEvent {
  constructor(public readonly appointment: Appointment) {}
}
