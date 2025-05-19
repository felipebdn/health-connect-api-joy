import { left, right, type Either } from '@/core/either'
import type { AffiliationRepository } from '../repositories/affiliation-repository'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { InstitutionRepository } from '../repositories/institution-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

interface RemoveAffiliationUseCaseRequest {
  institutionId: string
  providerId: string
}

type RemoveAffiliationUseCaseResponse = Either<ResourceNotFoundError, unknown>

export class RemoveAffiliationUseCase {
  constructor(
    private affiliationRepository: AffiliationRepository,
    private providerRepository: ProviderRepository,
    private institutionRepository: InstitutionRepository
  ) {}

  async execute({
    institutionId,
    providerId,
  }: RemoveAffiliationUseCaseRequest): Promise<RemoveAffiliationUseCaseResponse> {
    const provider = await this.providerRepository.findById(providerId)

    if (!provider) {
      return left(new ResourceNotFoundError('provider'))
    }

    const institution = await this.institutionRepository.findById(institutionId)

    if (!institution) {
      return left(new ResourceNotFoundError('institution'))
    }

    const affiliation =
      await this.affiliationRepository.findByProviderAndInstitution({
        institutionId,
        providerId,
      })

    if (!affiliation) {
      return left(new ResourceNotFoundError('affiliation'))
    }

    await this.affiliationRepository.delete({ institutionId, providerId })

    return right({})
  }
}
