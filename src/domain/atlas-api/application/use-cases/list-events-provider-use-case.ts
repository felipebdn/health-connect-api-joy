import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { EventEntity } from '../../enterprise/entities/event'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { EventRepository } from '../repositories/recurrence-repository'

interface ListEventsProviderUseCaseRequest {
  providerId: string
}

type ListEventsProviderUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    events: {
      event: EventEntity
      appointment?: Appointment
    }[]
  }
>

export class ListEventsProviderUseCase {
  constructor(
    private providerRepository: ProviderRepository,
    private eventRepository: EventRepository
  ) {}

  async execute({
    providerId,
  }: ListEventsProviderUseCaseRequest): Promise<ListEventsProviderUseCaseResponse> {
    const provider = this.providerRepository.findById(providerId)

    if (!provider) {
      return left(new ResourceNotFoundError('provider'))
    }

    const events =
      await this.eventRepository.findManyEventsAvailable(providerId)

    const appointments =
      await this.eventRepository.findManyEventsUnavailable(providerId)

    const resultEvents = [
      ...events.map((item) => ({
        event: item,
      })),
      ...appointments,
    ]

    return right({ events: resultEvents })
  }
}
