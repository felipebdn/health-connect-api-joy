import type { ProviderRepository } from '@/domain/atlas-api/application/repositories/provider-repository'
import type { Provider } from '@/domain/atlas-api/enterprise/entities/provider'

export class InMemoryProviderRepository implements ProviderRepository {
  public items: Provider[] = []

  async create(provider: Provider) {
    this.items.push(provider)
  }

  async save(provider: Provider) {
    const providerIndex = this.items.findIndex(
      (item) => item.id === provider.id
    )

    this.items[providerIndex] = provider
  }

  async delete(providerId: string) {
    const providerIndex = this.items.findIndex(
      (item) => item.id.toValue() === providerId
    )
    this.items.splice(providerIndex, 1)
  }

  async findByFilter(data: {
    name?: string
    specialty?: string
    amount?: number
    page?: number
  }): Promise<Provider[]> {
    const { name, specialty, amount, page } = data

    let filteredProviders = this.items

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

    filteredProviders.sort((a, b) => a.name.localeCompare(b.name))

    // Paginação
    const take = amount ?? 20 // Número de itens por página (default: 20)
    const skip = page ? page * take : 0 // Ignorar os primeiros itens

    return filteredProviders.slice(skip, skip + take)
  }

  async findById(id: string): Promise<Provider | null> {
    const provider = this.items.find((item) => item.id.toValue() === id)

    if (!provider) {
      return null
    }
    return provider
  }

  async findByEmail(email: string) {
    const provider = this.items.find((item) => item.email === email)

    if (!provider) {
      return null
    }
    return provider
  }

  async findByCPF(cpf: string) {
    const provider = this.items.find((item) => item.cpf === cpf)

    if (!provider) {
      return null
    }
    return provider
  }
}
