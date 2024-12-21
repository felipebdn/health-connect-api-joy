import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import * as RRuleLib from 'rrule'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { type Either, left, right } from '@/core/either'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { EventRepository } from '../repositories/recurrence-repository'

const { RRule } = RRuleLib

dayjs.extend(isSameOrAfter)
interface ListAvailabilityByMonthUseCaseRequest {
  providerId: string
  date: Date
}

type ListAvailabilityByMonthUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    dates: Date[]
  }
>

export class ListAvailabilityByMonthUseCase {
  constructor(
    private eventRepository: EventRepository,
    private providerRepository: ProviderRepository
  ) {}

  async execute({
    date,
    providerId,
  }: ListAvailabilityByMonthUseCaseRequest): Promise<ListAvailabilityByMonthUseCaseResponse> {
    const provider = await this.providerRepository.findById(providerId)

    if (!provider) {
      return left(new ResourceNotFoundError('provider'))
    }

    const events =
      await this.eventRepository.findManyEventsAvailable(providerId)

    const daysByMonth: Date[] = []

    const firstDayOfMonth = dayjs(date).startOf('month').startOf('day').toDate()
    const lastDayOfMonth = dayjs(date)
      .set('date', dayjs(date).daysInMonth())
      .endOf('day')
      .toDate()

    for (const raw of events) {
      if (raw.recurrenceRule && raw.title === 'availability') {
        const days = RRule.fromString(raw.recurrenceRule).between(
          firstDayOfMonth,
          lastDayOfMonth,
          true
        )

        if (raw.recurrenceException) {
          const datesExceptions = raw.recurrenceException
            .split(',')
            .map((value) => new Date(value))

          const daysFiltered = days.filter((day) => {
            return !datesExceptions.some((dayException) =>
              dayjs(day).isSame(dayException, 'day')
            )
          })
          daysByMonth.push(...daysFiltered)
        } else {
          daysByMonth.push(...days)
        }
      } else if (!raw.recurrenceRule && raw.title === 'availability') {
        daysByMonth.push(raw.startTime)
      }
    }

    return right({
      dates: daysByMonth
        .filter((date, index, self) => {
          return (
            self.findIndex(
              (d) =>
                dayjs(d).format('DD/MM/YYYY') ===
                dayjs(date).format('DD/MM/YYYY')
            ) === index
          )
        })
        .sort((a, b) => a.getDate() - b.getDate()),
    })
  }
}
