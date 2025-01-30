import dayjs from 'dayjs'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { Appointment } from '../../enterprise/entities/appointment'
import { EventEntity } from '../../enterprise/entities/event'
import { EmailNotSent } from '../errors/email-not-sent'
import { MethodInvalidError } from '../errors/method-invalid-error'
import { type Either, left, right } from '@/core/either'
import type { AppointmentRepository } from '../repositories/appointment-repository'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { EventRepository } from '../repositories/recurrence-repository'
import type { EmailService } from '../services/email'
import type { PatientRepository } from '../repositories/patient-repository'

interface MakeAppointmentUseCaseRequest {
  date?: Date
  providerId: string
  eventId: string
  description?: string
  patientId: string
}

type MakeAppointmentUseCaseResponse = Either<
  ResourceNotFoundError | MethodInvalidError,
  { appointment: Appointment }
>

export class MakeAppointmentUseCase {
  constructor(
    private eventRepository: EventRepository,
    private appointmentRepository: AppointmentRepository,
    private providerRepository: ProviderRepository,
    private patientRepository: PatientRepository,
    private emailService: EmailService
  ) {}

  async execute(
    data: MakeAppointmentUseCaseRequest
  ): Promise<MakeAppointmentUseCaseResponse> {
    const event = await this.eventRepository.findById(data.eventId)
    const provider = await this.providerRepository.findById(data.providerId)
    const patient = await this.patientRepository.findById(data.patientId)

    if (!event) {
      return left(new ResourceNotFoundError('event'))
    }
    if (!provider) {
      return left(new ResourceNotFoundError('provider'))
    }
    if (!patient) {
      return left(new ResourceNotFoundError('patient'))
    }

    /**
     * Verifica se existe alguma regra de recorrência no evento,
     * se não existir, então cria um novo agendamento e muda o
     * evento para "appointment"
     */
    if (!event.recurrenceRule) {
      const appointment = Appointment.create({
        description: data.description ?? null,
        eventId: event.id,
        providerId: new UniqueEntityId(data.providerId),
        institutionId: event.institutionId,
        patientId: patient.id,
      })

      event.title = 'appointment'

      // const confirmation =
      //   await this.emailService.sendMessageConfirmationAppointment({
      //     action: 'Novo agendamento',
      //     action_subject: 'Agendamento',
      //     date: dayjs(event.startTime).format('DD/MM/YYYY'),
      //     patient_email: data.email,
      //     patient_name: data.name,
      //     provider_email: provider.email,
      //     provider_name: provider.name,
      //   })

      // if (!confirmation) {
      //   return left(new EmailNotSent())
      // }

      await this.appointmentRepository.create(appointment)
      await this.eventRepository.save(event)

      return right({
        appointment,
      })
    }
    /**
     * Se existir alguma regra de recorrência e não existe o recurrence ID,
     * significa que é um simples recorrência, então cria um novo evento a partir
     * do evento atual, depois cria um agendamento fazendo referencia ao novo evento
     * e por fim atualiza o "recurrenceException" com a data do novo evento criado.
     */
    if (event.recurrenceRule && !event.recurrenceID && data.date) {
      const newAppointmentEvent = EventEntity.create({
        endTime: dayjs(data.date)
          .hour(event.endTime.getHours())
          .minute(event.endTime.getMinutes())
          .startOf('minute')
          .toDate(),
        endTimezone: event.endTimezone,
        providerId: event.providerId,
        startTime: dayjs(data.date)
          .hour(event.startTime.getHours())
          .minute(event.startTime.getMinutes())
          .startOf('minute')
          .toDate(),
        startTimezone: event.startTimezone,
        title: 'appointment',
        institutionId: event.institutionId,
      })
      event.recurrenceException = data.date
      const appointment = Appointment.create({
        description: data.description ?? null,
        eventId: newAppointmentEvent.id,
        providerId: provider.id,
        institutionId: event.institutionId,
        patientId: patient.id,
      })

      // const confirmation =
      //   await this.emailService.sendMessageConfirmationAppointment({
      //     action: 'Novo agendamento',
      //     action_subject: 'Agendamento',
      //     date: dayjs(event.startTime).format('DD/MM/YYYY'),
      //     patient_email: data.email,
      //     patient_name: data.name,
      //     provider_email: provider.email,
      //     provider_name: provider.name,
      //   })

      // if (!confirmation) {
      //   return left(new EmailNotSent())
      // }

      await this.eventRepository.create(newAppointmentEvent)
      await this.eventRepository.save(event)
      await this.appointmentRepository.create(appointment)

      return right({ appointment })
    }
    /**
     * Se existir um regra de recorrência e se existir um "recurrenceID" significa que
     * é um evento editado a partir de uma recorrência, então remove toda referencia à
     * recorrência anterior e define o title para "appointment", e por fim cria o agendamento
     * fazendo referencia a esse evento editado.
     */
    if (event.recurrenceRule && event.recurrenceID) {
      const appointment = Appointment.create({
        description: data.description ?? null,
        eventId: event.id,
        providerId: new UniqueEntityId(data.providerId),
        institutionId: event.institutionId,
        patientId: patient.id,
      })
      event.title = 'appointment'
      event.recurrenceID = undefined
      event.recurrenceException = undefined

      // const confirmation =
      //   await this.emailService.sendMessageConfirmationAppointment({
      //     action: 'Novo agendamento',
      //     action_subject: 'Agendamento',
      //     date: dayjs(event.startTime).format('DD/MM/YYYY'),
      //     patient_email: data.email,
      //     patient_name: data.name,
      //     provider_email: provider.email,
      //     provider_name: provider.name,
      //   })

      // if (!confirmation) {
      //   return left(new EmailNotSent())
      // }

      await this.appointmentRepository.create(appointment)
      await this.eventRepository.save(event)

      return right({ appointment })
    }

    return left(new MethodInvalidError())
  }
}
