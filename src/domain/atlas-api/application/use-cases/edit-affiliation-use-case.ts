import { left, right, type Either } from '@/core/either'
import type { AffiliationRepository } from '../repositories/affiliation-repository'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { InstitutionRepository } from '../repositories/institution-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

interface EditAffiliationUseCaseRequest {
  institutionId: string
  providerId: string
  status: 'ACTIVE' | 'PAUSED'
}

type EditAffiliationUseCaseResponse = Either<ResourceNotFoundError, unknown>

export class EditAffiliationUseCase {
  constructor(
    private affiliationRepository: AffiliationRepository,
    private providerRepository: ProviderRepository,
    private institutionRepository: InstitutionRepository
  ) {}

  async execute({
    institutionId,
    providerId,
    status,
  }: EditAffiliationUseCaseRequest): Promise<EditAffiliationUseCaseResponse> {
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

    affiliation.status = status

    await this.affiliationRepository.save(affiliation)

    return right({})
  }
}
