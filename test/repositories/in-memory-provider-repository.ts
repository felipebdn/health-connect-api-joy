import type { ProviderRepository } from '@/domain/atlas-api/application/repositories/provider-repository'
import type { Provider } from '@/domain/atlas-api/enterprise/entities/provider'

export class InMemoryProviderRepository implements ProviderRepository {
  public items: Provider[] = []

  async getAll(): Promise<Provider[]> {
    return this.items
  }

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

  async findByPhone(phone: string): Promise<Provider | null> {
    const provider = this.items.find((item) => item.phone === phone)

    if (!provider) {
      return null
    }
    return provider
  }
}
