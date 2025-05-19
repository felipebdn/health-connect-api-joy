import type { AppointmentRepository } from '@/domain/atlas-api/application/repositories/appointment-repository'
import type { Appointment } from '@/domain/atlas-api/enterprise/entities/appointment'

export class InMemoryAppointmentRepository implements AppointmentRepository {
  public items: Appointment[] = []

  async getAll(): Promise<Appointment[]> {
    return this.items
  }

  async create(appointment: Appointment): Promise<void> {
    this.items.push(appointment)
  }

  async save(appointment: Appointment): Promise<void> {
    const appointmentIndex = this.items.findIndex(
      (item) => item.id === appointment.id
    )

    this.items[appointmentIndex] = appointment
  }

  async delete(appointmentId: string): Promise<void> {
    const appointmentIndex = this.items.findIndex(
      (item) => item.id.toValue() === appointmentId
    )
    this.items.splice(appointmentIndex, 1)
  }

  async findById(appointmentId: string): Promise<Appointment | null> {
    const appointment = this.items.find(
      (item) => item.id.toValue() === appointmentId
    )
    if (!appointment) {
      return null
    }
    return appointment
  }

  async findByEventId(eventId: string): Promise<Appointment | null> {
    const appointment = this.items.find(
      (item) => item.eventId.toValue() === eventId
    )
    if (!appointment) {
      return null
    }
    return appointment
  }

  async findManyByProviderId(providerId: string): Promise<Appointment[]> {
    return this.items.filter((item) => item.providerId.toValue() === providerId)
  }
}
