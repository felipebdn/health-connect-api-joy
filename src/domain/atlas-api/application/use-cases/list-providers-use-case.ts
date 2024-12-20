import { type Either, right } from '@/core/either'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { Provider } from '../../enterprise/entities/provider'

interface ListProvidersUseCaseRequest {
  name?: string
  specialty?: string
  amount?: number
  limit?: number
}

type ListProvidersUseCaseResponse = Either<
  unknown,
  {
    providers: Provider[]
  }
>

export class ListProvidersUseCase {
  constructor(private providerRepository: ProviderRepository) {}

  async execute(
    data: ListProvidersUseCaseRequest
  ): Promise<ListProvidersUseCaseResponse> {
    const providers = await this.providerRepository.findByFilter(data)

    return right({ providers })
  }
}
