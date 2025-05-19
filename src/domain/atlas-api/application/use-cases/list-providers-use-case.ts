import type { Provider } from '../../enterprise/entities/provider'
import RRuleLib from 'rrule'
import { EventEntity } from '../../enterprise/entities/event'
import type { ProviderEventRatingRepository } from '../repositories/provider-event-rating-repository'
import type { Rating } from '../../enterprise/entities/rating'
import { parseRecurrenceWithExceptions } from '@/utils/parse-rule-with-exceptions'
import type { Address } from '../../enterprise/entities/address'

const { RRule } = RRuleLib

interface ListProvidersUseCaseRequest {
  name?: string
  specialty?: string
  price?: number
  amount?: number
  limit?: number
}

type ListProvidersUseCaseResponse = {
  providers: {
    provider: Provider
    ratings: Rating[]
    address?: Address
  }[]
}

const now = new Date()

export class ListProvidersUseCase {
  constructor(private providerEventRepository: ProviderEventRatingRepository) {}

  async execute(
    data: ListProvidersUseCaseRequest
  ): Promise<ListProvidersUseCaseResponse> {
    const providersWithEvents =
      await this.providerEventRepository.findByFilterWithEvents(data)

    const providersWithNextAvailability = providersWithEvents.map(
      (provider) => {
        const futureEvents: EventEntity[] = []

        for (const event of provider.events) {
          if (event.recurrenceRule) {
            const rule = parseRecurrenceWithExceptions({
              dtStart: event.startTime,
              recurrenceRule: event.recurrenceRule,
              recurrenceException: event.recurrenceException,
            })
            const nextOccurrences = rule.between(
              now,
              new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            )

            for (const date of nextOccurrences) {
              futureEvents.push(
                EventEntity.create({
                  endTimezone: event.endTimezone,
                  providerId: event.providerId,
                  startTimezone: event.startTimezone,
                  title: event.title,
                  institutionId: event.institutionId,
                  recurrenceException: event.recurrenceException,
                  recurrenceID: event.recurrenceID,
                  recurrenceRule: event.recurrenceRule,
                  startTime: date,
                  endTime: new Date(
                    date.getTime() +
                      (event.endTime.getTime() - event.startTime.getTime())
                  ),
                })
              )
            }
          } else if (event.startTime >= now) {
            futureEvents.push(event)
          }
        }

        futureEvents.sort(
          (a, b) => a.startTime.getTime() - b.startTime.getTime()
        )

        provider.provider.nextAvailability =
          futureEvents[0]?.startTime || undefined

        return {
          provider: provider.provider,
          ratings: provider.ratings,
          address: provider.address,
        }
      }
    )

    return {
      providers: providersWithNextAvailability.map((item) => ({
        provider: item.provider,
        ratings: item.ratings,
        address: item.address,
      })),
    }
  }
}
