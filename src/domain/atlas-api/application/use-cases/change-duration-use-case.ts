import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { ProviderRepository } from '../repositories/provider-repository'

interface ChangeDurationUseCaseRequest {
  providerId: string
  duration: number
}

type ChangeDurationUseCaseResponse = Either<ResourceNotFoundError, unknown>

export class ChangeDurationUseCase {
  constructor(private providerRepository: ProviderRepository) {}

  async execute({
    duration,
    providerId,
  }: ChangeDurationUseCaseRequest): Promise<ChangeDurationUseCaseResponse> {
    const provider = await this.providerRepository.findById(providerId)

    if (!provider) {
      return left(new ResourceNotFoundError('provider'))
    }

    provider.duration = duration * 60 // Converted in seconds

    await this.providerRepository.save(provider)

    return right({})
  }
}
