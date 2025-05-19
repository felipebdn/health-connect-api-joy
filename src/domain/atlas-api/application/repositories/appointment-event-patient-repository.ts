import type { Appointment } from '../../enterprise/entities/appointment'
import type { EventEntity } from '../../enterprise/entities/event'
import type { Patient } from '../../enterprise/entities/patient'
import type { Provider } from '../../enterprise/entities/provider'

export type findManyWithEventAndPatientResponse = {
  appointment: Appointment
  event: EventEntity
  provider: Provider
  patient: Patient
}[]

export interface AppointmentEventPatientRepository {
  findManyWithEventAndPatient(
    date: Date,
    institution?: string
  ): Promise<findManyWithEventAndPatientResponse>
  findManyEventsUnavailable(providerId: string): Promise<
    {
      event: EventEntity
      appointment: Appointment
    }[]
  >
}
