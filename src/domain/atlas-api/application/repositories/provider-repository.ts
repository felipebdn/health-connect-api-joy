import type { Provider } from '../../enterprise/entities/provider'

type listProvidersProps = {
  name?: string
  specialty?: string
  amount?: number
  page?: number
}

export interface ProviderRepository {
  create(provider: Provider): Promise<void>
  save(provider: Provider): Promise<void>
  delete(providerId: string): Promise<void>
  findByFilter(data: listProvidersProps): Promise<Provider[]>
  findById(id: string): Promise<Provider | null>
  findByEmail(email: string): Promise<Provider | null>
  findByCPF(cpf: string): Promise<Provider | null>
}
