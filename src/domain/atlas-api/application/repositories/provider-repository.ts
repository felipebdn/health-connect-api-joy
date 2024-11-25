import type { Provider } from '../../enterprise/entities/provider'

export interface ProviderRepository {
  create(provider: Provider): Promise<void>
  save(provider: Provider): Promise<void>
  delete(providerId: string): Promise<void>
  findById(id: string): Promise<Provider | null>
  findByEmail(email: string): Promise<Provider | null>
  findByCPF(cpf: string): Promise<Provider | null>
}
