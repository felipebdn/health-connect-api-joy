import type {
  AppointmentEventPatientRepository,
  findManyWithEventAndPatientResponse,
} from '@/domain/atlas-api/application/repositories/appointment-event-patient-repository'
import type { AppointmentRepository } from '@/domain/atlas-api/application/repositories/appointment-repository'
import type { PatientRepository } from '@/domain/atlas-api/application/repositories/patient-repository'
import type { ProviderRepository } from '@/domain/atlas-api/application/repositories/provider-repository'
import type { EventRepository } from '@/domain/atlas-api/application/repositories/recurrence-repository'
import type { Appointment } from '@/domain/atlas-api/enterprise/entities/appointment'
import type { EventEntity } from '@/domain/atlas-api/enterprise/entities/event'
import dayjs from 'dayjs'

export class InMemoryAppointmentEventPatientRepository
  implements AppointmentEventPatientRepository
{
  constructor(
    private appointmentRepository: AppointmentRepository,
    private eventRepository: EventRepository,
    private patientRepository: PatientRepository,
    private providerRepository: ProviderRepository
  ) {}

  async findManyWithEventAndPatient(
    day: Date
  ): Promise<findManyWithEventAndPatientResponse> {
    const appointments: findManyWithEventAndPatientResponse = []

    const allAppointments = await this.appointmentRepository.getAll()

    for (const appointment of allAppointments) {
      const event = await this.eventRepository.findById(
        appointment.eventId.toString()
      )
      const patient = await this.patientRepository.findById(
        appointment.patientId.toString()
      )
      const provider = await this.providerRepository.findById(
        appointment.providerId.toString()
      )

      if (
        event &&
        patient &&
        provider &&
        dayjs(event.startTime).isSame(day, 'day')
      ) {
        appointments.push({ appointment, event, patient, provider })
      }
    }

    return appointments
  }

  async findManyEventsUnavailable(
    providerId: string
  ): Promise<{ event: EventEntity; appointment: Appointment }[]> {
    const appointments =
      await this.appointmentRepository.findManyByProviderId(providerId)

    const events = await this.eventRepository.getAll()
    const data = appointments.map((item) => ({
      event: events.find((event) => event.id === item.eventId) ?? events[0],
      appointment: item,
    }))

    return data
  }
}
