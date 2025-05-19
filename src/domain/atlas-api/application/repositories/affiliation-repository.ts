import type { Affiliation } from '../../enterprise/entities/affiliation'
import type { Institution } from '../../enterprise/entities/institution'
import type { Provider } from '../../enterprise/entities/provider'

type AffiliationsList = {
  affiliation: Affiliation
  provider: Provider
  institution: Institution
}

export interface AffiliationRepository {
  create(affiliation: Affiliation): Promise<void>
  save(affiliation: Affiliation): Promise<void>
  delete(data: {
    providerId: string
    institutionId: string
  }): Promise<void>
  findByProviderAndInstitution(data: {
    providerId: string
    institutionId: string
  }): Promise<Affiliation | null>
  listAffiliationByProviderOrInstitution(data: {
    providerId?: string
    institutionId?: string
  }): Promise<AffiliationsList[]>
}
