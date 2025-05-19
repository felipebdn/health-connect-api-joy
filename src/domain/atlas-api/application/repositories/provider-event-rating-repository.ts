import type { Address } from '../../enterprise/entities/address'
import type { Appointment } from '../../enterprise/entities/appointment'
import type { EventEntity } from '../../enterprise/entities/event'
import type { Provider } from '../../enterprise/entities/provider'
import type { Rating } from '../../enterprise/entities/rating'

export type findByFilterWithEventsProps = {
  name?: string
  specialty?: string
  price?: number
  amount?: number
  page?: number
}
export type findByFilterWithEventsResponse = {
  provider: Provider
  events: EventEntity[]
  ratings: Rating[]
  address?: Address
}

export type findByInstitutionProps = {
  institutionId: string
  specialty?: string
  occupation?: string
}

export type findByInstitutionResponse = {
  provider: Provider
  appointments: { appointment: Appointment; event: EventEntity }[]
  ratings: Rating[]
}

export interface ProviderEventRatingRepository {
  findByFilterWithEvents(
    data: findByFilterWithEventsProps
  ): Promise<findByFilterWithEventsResponse[]>

  findByInstitution(
    data: findByInstitutionProps
  ): Promise<findByInstitutionResponse[]>
}
