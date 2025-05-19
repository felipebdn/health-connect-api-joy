import { right, type Either } from '@/core/either'
import type { AffiliationRepository } from '../repositories/affiliation-repository'
import type { Affiliation } from '../../enterprise/entities/affiliation'
import type { Provider } from '../../enterprise/entities/provider'
import type { Institution } from '../../enterprise/entities/institution'

interface ListAffiliationsUseCaseRequest {
  providerId?: string
  institutionId?: string
}

type ListAffiliationsUseCaseResponse = {
  affiliations: {
    affiliation: Affiliation
    provider: Provider
    institution: Institution
  }[]
}

export class ListAffiliationsUseCase {
  constructor(private affiliationRepository: AffiliationRepository) {}

  async execute({
    institutionId,
    providerId,
  }: ListAffiliationsUseCaseRequest): Promise<ListAffiliationsUseCaseResponse> {
    const affiliations =
      await this.affiliationRepository.listAffiliationByProviderOrInstitution({
        institutionId,
        providerId,
      })

    return { affiliations }
  }
}
