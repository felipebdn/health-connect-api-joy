import type { listProvidersResponse } from '@/domain/atlas-api/application/repositories/provider-event-rating-repository'
import type { ProviderRepository } from '@/domain/atlas-api/application/repositories/provider-repository'
import type { RatingRepository } from '@/domain/atlas-api/application/repositories/rating-repository'
import type { EventRepository } from '@/domain/atlas-api/application/repositories/recurrence-repository'

export class InMemoryProviderEventRepository {
  constructor(
    private providerRepository: ProviderRepository,
    private eventRepository: EventRepository,
    private ratingRepository: RatingRepository
  ) {}

  async findByFilterWithEvents(data: {
    name?: string
    specialty?: string
    price?: number
    amount?: number
    page?: number
  }): Promise<listProvidersResponse[]> {
    const { name, specialty, amount, page, price } = data

    let filteredProviders = await this.providerRepository.getAll()

    // Filtro por nome
    if (name) {
      filteredProviders = filteredProviders.filter((provider) =>
        provider.name.toLowerCase().includes(name.toLowerCase())
      )
    }

    // Filtro por especialidade
    if (specialty) {
      filteredProviders = filteredProviders.filter(
        (provider) => provider.specialty === specialty
      )
    }

    // Filtro por preço
    if (price) {
      filteredProviders = filteredProviders.filter(
        (provider) => provider.price <= price
      )
    }

    filteredProviders.sort((a, b) => a.name.localeCompare(b.name))

    const providersWithYourEvents: listProvidersResponse[] = []

    for (const provider of filteredProviders) {
      const events = await this.eventRepository.findManyEventsAvailable(
        provider.id.toString()
      )
      const ratings = await this.ratingRepository.findManyByProvider(
        provider.id.toString()
      )
      providersWithYourEvents.push({ events: events, provider, ratings })
    }

    // Paginação
    const take = amount ?? 20 // Número de itens por página (default: 20)
    const skip = page ? page * take : 0 // Ignorar os primeiros itens

    return providersWithYourEvents.slice(skip, skip + take)
  }
}
