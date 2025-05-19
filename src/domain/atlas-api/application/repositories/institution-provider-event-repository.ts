import type { EventEntity } from '../../enterprise/entities/event'
import type { Provider } from '../../enterprise/entities/provider'

export interface listAvailabilitiesByDayResponses {
  provider: Provider
  events: EventEntity[]
}

export interface InstitutionProviderEventRepository {
  listAvailabilitiesByDay(data: {
    institutionId: string
  }): Promise<listAvailabilitiesByDayResponses[]>
}
