import { type Either, right } from '@/core/either'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { AppointmentRepository } from '../repositories/appointment-repository'

interface ListAppointmentsEmailCPFUseCaseRequest {
  email?: string
  cpf?: string
}

type ListAppointmentsEmailCPFUseCaseResponse = Either<
  unknown,
  { appointments: Appointment[] }
>

export class ListAppointmentsEmailCPFUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(
    data: ListAppointmentsEmailCPFUseCaseRequest
  ): Promise<ListAppointmentsEmailCPFUseCaseResponse> {
    const appointments = await this.appointmentRepository.findByEmailOrCPF({
      ...data,
    })

    return right({ appointments })
  }
}
