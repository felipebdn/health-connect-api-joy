import dayjs from 'dayjs'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { type Either, left, right } from '@/core/either'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { EventRepository } from '../repositories/recurrence-repository'
import { RRule } from '@/lib/rrule'

export interface Schedules {
  eventId: string
  startTime: Date
  endTime: Date
}

interface ListAvailabilityDayUseCaseRequest {
  providerId: string
  date: Date
}

type ListAvailabilityDayUseCaseResponse = Either<
  ResourceNotFoundError,
  { schedules: Schedules[] }
>

export class ListAvailabilityDayUseCase {
  constructor(
    private eventRepository: EventRepository,
    private providerRepository: ProviderRepository
  ) {}

  async execute({
    date,
    providerId,
  }: ListAvailabilityDayUseCaseRequest): Promise<ListAvailabilityDayUseCaseResponse> {
    const provider = await this.providerRepository.findById(providerId)

    if (!provider) {
      return left(new ResourceNotFoundError('provider'))
    }

    const events =
      await this.eventRepository.findManyEventsAvailable(providerId)

    const times: Schedules[] = []

    for (const raw of events) {
      if (raw.recurrenceRule) {
        const ruleOptions = RRule.parseString(raw.recurrenceRule)
        ruleOptions.dtstart = raw.startTime

        const rrule = new RRule(ruleOptions)

        const startTime = dayjs(date)
          .set('hour', raw.startTime.getHours())
          .set('minute', raw.startTime.getMinutes())
          .toDate()
        const endTime = dayjs(date)
          .set('hour', raw.endTime.getHours())
          .set('minute', raw.endTime.getMinutes())
          .toDate()

        const timesResult = rrule.between(
          dayjs(date).startOf('date').toDate(),
          dayjs(date).endOf('date').toDate()
        )

        if (raw.recurrenceException) {
          const datesExceptions = raw.recurrenceException
            .split(',')
            .map((value) => new Date(value))

          const daysFiltered = timesResult.filter((day: Date) => {
            return !datesExceptions.some((dayException) =>
              dayjs(day).isSame(dayException, 'day')
            )
          })

          times.push(
            ...daysFiltered.map(() => ({
              startTime,
              endTime,
              eventId: raw.id.toValue(),
            }))
          )
        } else {
          times.push(
            ...timesResult.map(() => ({
              startTime,
              endTime,
              eventId: raw.id.toValue(),
            }))
          )
        }
      } else if (!raw.recurrenceRule) {
        if (dayjs(date).isSame(raw.startTime, 'day')) {
          times.push({
            endTime: raw.endTime,
            startTime: raw.startTime,
            eventId: raw.id.toValue(),
          })
        }
      }
    }

    const timesSorted = times.sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    )

    return right({ schedules: timesSorted })
  }
}
