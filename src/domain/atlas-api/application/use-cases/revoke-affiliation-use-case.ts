import type { AffiliationRepository } from '../repositories/affiliation-repository'
import type { ProviderRepository } from '../repositories/provider-repository'
import { left, right, type Either } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { InstitutionRepository } from '../repositories/institution-repository'

interface RevokeAffiliationUseCaseRequest {
  providerId: string
  institutionId: string
}

type RevokeAffiliationUseCaseResponses = Either<ResourceNotFoundError, unknown>

export class RevokeAffiliationUseCase {
  constructor(
    private affiliationRepository: AffiliationRepository,
    private providerRepository: ProviderRepository,
    private institutionRepository: InstitutionRepository
  ) {}

  async execute(
    data: RevokeAffiliationUseCaseRequest
  ): Promise<RevokeAffiliationUseCaseResponses> {
    const provider = await this.providerRepository.findById(data.providerId)

    if (!provider) {
      return left(new ResourceNotFoundError('provider'))
    }

    const institution = await this.institutionRepository.findById(
      data.institutionId
    )

    if (!institution) {
      return left(new ResourceNotFoundError('institution'))
    }

    const affiliation =
      await this.affiliationRepository.findByProviderAndInstitution({
        institutionId: data.institutionId,
        providerId: data.providerId,
      })

    if (!affiliation) {
      return left(new ResourceNotFoundError('affiliation'))
    }

    await this.affiliationRepository.delete({
      institutionId: institution.id.toString(),
      providerId: provider.id.toString(),
    })

    return right({})
  }
}
