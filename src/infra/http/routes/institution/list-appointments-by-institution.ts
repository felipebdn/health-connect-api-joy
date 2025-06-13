import { left, right, type Either } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { AppointmentEventPatientRepository } from '@/domain/atlas-api/application/repositories/appointment-event-patient-repository'
import type { InstitutionRepository } from '@/domain/atlas-api/application/repositories/institution-repository'
import type { Appointment } from '@/domain/atlas-api/enterprise/entities/appointment'
import type { EventEntity } from '@/domain/atlas-api/enterprise/entities/event'
import type { Patient } from '@/domain/atlas-api/enterprise/entities/patient'
import type { Provider } from '@/domain/atlas-api/enterprise/entities/provider'

interface ListAppointmentsByInstitutionRequest {
  institutionId: string
  date: Date
  providerName?: string
}

type ListAppointmentsByInstitutionResponse = Either<
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

export class ListAppointmentsByInstitution {
  constructor(
    private institutionRepository: InstitutionRepository,
    private appointmentWithProviderEventRepository: AppointmentEventPatientRepository
  ) {}

  async execute(
    data: ListAppointmentsByInstitutionRequest
  ): Promise<ListAppointmentsByInstitutionResponse> {
    const institution = await this.institutionRepository.findById(
      data.institutionId
    )

    if (!institution) {
      return left(new ResourceNotFoundError('institution'))
    }

    const appointments =
      await this.appointmentWithProviderEventRepository.findManyWithEventAndPatient(
        {
          date: data.date,
          institution: data.institutionId,
          providerName: data.providerName,
        }
      )

    return right({ appointments })
  }
}
