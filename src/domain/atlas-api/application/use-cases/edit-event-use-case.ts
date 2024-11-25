import dayjs from 'dayjs'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { EventEntity } from '../../enterprise/entities/event'
import { MethodInvalidError } from '../errors/method-invalid-error'
import { SchedulesConflict } from '../errors/schedules-conflict-error'
import { type Either, left, right } from '@/core/either'
import type { EventRepository } from '../repositories/recurrence-repository'

interface EditEventUseCaseRequest {
  type: 'event' | 'recurrence'
  eventId: string
  startTime: Date
  endTime: Date
  startTimezone: string
  endTimezone: string
  recurrenceRule?: string
  currentStartTime?: Date
}

type EditEventUseCaseResponse = Either<
  ResourceNotFoundError | MethodInvalidError,
  unknown
>

export class EditEventUseCase {
  constructor(private eventRepository: EventRepository) {}

  async execute(
    props: EditEventUseCaseRequest
  ): Promise<EditEventUseCaseResponse> {
    const event = await this.eventRepository.findById(props.eventId)

    if (!event) {
      return left(new ResourceNotFoundError('event'))
    }

    if (event.title === 'appointment') {
      return left(new MethodInvalidError())
    }

    const duration = dayjs(event.endTime).diff(event.startTime, 'minutes')

    const isNotSameTimeDuration = !this.checkEditingDuration({
      duration,
      endTime: props.endTime,
      startTime: props.startTime,
    })

    switch (true) {
      // Caso o espaço de tempo entre o endTime e o startTime for diferente da duração em minutos retorna erro.
      case isNotSameTimeDuration:
        return left(new SchedulesConflict())

      // Caso seja edição de um evento único e não possui a regra de recorrência, então apenas atualiza o evento.
      case props.type === 'event' && !event.recurrenceRule:
        event.startTime = props.startTime
        event.endTime = props.endTime
        event.startTimezone = props.startTimezone
        event.endTimezone = props.endTimezone
        await this.eventRepository.save(event)
        return right({})

      // Caso seja edição de um evento único e possui uma regra de recorrência, então cria um novo evento e adiciona a data no "recurrenceException" do evento pai.
      case props.type === 'event' && !!event.recurrenceRule: {
        if (!props.currentStartTime) {
          return left(new MethodInvalidError())
        }
        const newEvent = EventEntity.create({
          endTime: props.endTime,
          endTimezone: props.endTimezone,
          providerId: event.providerId,
          startTime: props.startTime,
          startTimezone: props.startTimezone,
          title: 'availability',
          recurrenceID: event.id,
        })
        event.recurrenceException = props.currentStartTime

        await this.eventRepository.save(event)
        await this.eventRepository.create(newEvent)
        return right({})
      }

      // Caso seja edição de uma recorrência apenas atualiza os dados do evento.
      case props.type === 'recurrence' && !!event.recurrenceRule:
        event.startTime = props.startTime
        event.endTime = props.endTime
        event.startTimezone = props.startTimezone
        event.endTimezone = props.endTimezone
        event.recurrenceRule = props.recurrenceRule
        await this.eventRepository.save(event)
        return right({})

      default:
        return left(new MethodInvalidError())
    }
  }

  checkEditingDuration({
    startTime,
    endTime,
    duration,
  }: {
    startTime: Date
    endTime: Date
    duration: number
  }) {
    const diferenceTimeInMinutes = dayjs(endTime).diff(startTime, 'minutes')

    if (diferenceTimeInMinutes !== duration) {
      return false
    }
    return true
  }
}
