import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { Provider } from '../../enterprise/entities/provider'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { AddressRepository } from '../repositories/address-repository'
import type { RatingRepository } from '../repositories/rating-repository'
import type { Rating } from '../../enterprise/entities/rating'
import type { Address } from '../../enterprise/entities/address'

interface GetProviderUseCaseRequest {
  providerId: string
}

type GetProviderUseCaseResponse = Either<
  ResourceNotFoundError,
  { provider: Provider; address: Address | null; ratings: Rating[] }
>

export class GetProviderUseCase {
  constructor(
    private providerRepository: ProviderRepository,
    private addressRepository: AddressRepository,
    private ratingRepository: RatingRepository
  ) {}

  async execute({
    providerId,
  }: GetProviderUseCaseRequest): Promise<GetProviderUseCaseResponse> {
    const provider = await this.providerRepository.findById(providerId)

    if (!provider) {
      return left(new ResourceNotFoundError('provider'))
    }

    let address: Address | null = null

    if (provider.addressId) {
      address = await this.addressRepository.findById(
        provider.addressId?.toValue()
      )
    }

    const ratings = await this.ratingRepository.findManyByProvider(
      provider.id.toValue()
    )

    return right({ provider, address, ratings })
  }
}
