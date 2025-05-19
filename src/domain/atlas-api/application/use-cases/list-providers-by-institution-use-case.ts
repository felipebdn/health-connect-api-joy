import { right, type Either } from '@/core/either'
import type { Provider } from '../../enterprise/entities/provider'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { EventEntity } from '../../enterprise/entities/event'
import type { Rating } from '../../enterprise/entities/rating'
import type { ProviderEventRatingRepository } from '../repositories/provider-event-rating-repository'

interface ListProvidersByInstitutionRequest {
  institutionId: string
  specialty?: string
  occupation?: string
}

type ListProvidersByInstitutionResponse = {
  providers: {
    provider: Provider
    appointments: { appointment: Appointment; event: EventEntity }[]
    ratings: Rating[]
  }[]
}

export class ListProvidersByInstitutionUseCase {
  constructor(
    private providerEventRatingRepository: ProviderEventRatingRepository
  ) {}

  async execute(
    data: ListProvidersByInstitutionRequest
  ): Promise<ListProvidersByInstitutionResponse> {
    const providers =
      await this.providerEventRatingRepository.findByInstitution({
        institutionId: data.institutionId,
        occupation: data.occupation,
        specialty: data.specialty,
      })

    return { providers }
  }
}
