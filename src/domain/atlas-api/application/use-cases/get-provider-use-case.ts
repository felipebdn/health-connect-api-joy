import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { Provider } from '../../enterprise/entities/provider'
import type { ProviderRepository } from '../repositories/provider-repository'

interface GetProviderUseCaseRequest {
  providerId: string
}

type GetProviderUseCaseResponse = Either<
  ResourceNotFoundError,
  { provider: Provider }
>

export class GetProviderUseCase {
  constructor(private providerRepository: ProviderRepository) {}

  async execute({
    providerId,
  }: GetProviderUseCaseRequest): Promise<GetProviderUseCaseResponse> {
    const provider = await this.providerRepository.findById(providerId)
    if (!provider) {
      return left(new ResourceNotFoundError('provider'))
    }
    return right({ provider })
  }
}
