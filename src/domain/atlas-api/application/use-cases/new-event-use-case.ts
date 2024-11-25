import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { EventEntity } from '../../enterprise/entities/event'
import { SchedulesConflict } from '../errors/schedules-conflict-error'
import { type Either, left, right } from '@/core/either'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { EventRepository } from '../repositories/recurrence-repository'

dayjs.extend(isSameOrBefore)

interface NewEventUseCaseRequest {
  providerId: string
  title: 'availability'
  startTime: Date
  endTime: Date
  startTimezone: string
  endTimezone: string
  recurrenceRule?: string
  duration: number
}

interface splitEventsProps {
  startTime: Date
  endTime: Date
  duration: number
}

type NewEventUseCaseResponse = Either<
  ResourceNotFoundError | SchedulesConflict,
  unknown
>

export class NewEventUseCase {
  constructor(
    private eventRepository: EventRepository,
    private providerRepository: ProviderRepository
  ) {}

  async execute(
    data: NewEventUseCaseRequest
  ): Promise<NewEventUseCaseResponse> {
    const provider = await this.providerRepository.findById(data.providerId)

    if (!provider) {
      return left(new ResourceNotFoundError('provider'))
    }

    const diferenceTime = dayjs(data.endTime).diff(data.startTime, 'seconds')

    if (diferenceTime < data.duration * 60) {
      return left(new SchedulesConflict())
    }

    const events = this.splitEvents({
      duration: data.duration * 60, // converted to seconds
      endTime: data.endTime,
      startTime: data.startTime,
    })

    const eventsEntities = events.map((item) =>
      EventEntity.create({
        endTime: item.endTime,
        endTimezone: data.endTimezone,
        providerId: new UniqueEntityId(data.providerId),
        startTime: item.startTime,
        startTimezone: data.startTimezone,
        title: data.title,
        recurrenceRule: data.recurrenceRule,
      })
    )

    await this.eventRepository.createMany(eventsEntities)

    return right({})
  }

  private splitEvents({ duration, endTime, startTime }: splitEventsProps) {
    const dates: { startTime: Date; endTime: Date }[] = []

    let date = startTime

    while (dayjs(date).isBefore(endTime)) {
      const dateAddedDuration = dayjs(date).add(duration, 'second')
      if (dateAddedDuration.isSameOrBefore(endTime)) {
        dates.push({
          startTime: date,
          endTime: dateAddedDuration.toDate(),
        })
      }
      date = dateAddedDuration.toDate()
    }
    return dates
  }
}
