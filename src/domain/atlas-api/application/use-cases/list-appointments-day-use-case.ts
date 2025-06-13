import { right, type Either } from '@/core/either'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { EventEntity } from '../../enterprise/entities/event'
import type { Patient } from '../../enterprise/entities/patient'
import type { AppointmentEventPatientRepository } from '../repositories/appointment-event-patient-repository'
import type { Provider } from '../../enterprise/entities/provider'

interface ListAppointmentsDayUseCaseRequest {
  day: Date
  institutionId?: string
}

type ListAppointmentsDayUseCaseResponse = Either<
  unknown,
  {
    appointments: {
      appointment: Appointment
      provider: Provider
      event: EventEntity
      patient: Patient
    }[]
  }
>

export class ListAppointmentsDayUseCase {
  constructor(
    private appointmentEventPatientRepository: AppointmentEventPatientRepository
  ) {}

  async execute({
    day,
    institutionId,
  }: ListAppointmentsDayUseCaseRequest): Promise<ListAppointmentsDayUseCaseResponse> {
    const appointments =
      await this.appointmentEventPatientRepository.findManyWithEventAndPatient({
        date: day,
        institutionId,
      })

    return right({ appointments })
  }
}
