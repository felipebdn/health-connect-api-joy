import type { AffiliationCode } from '../../enterprise/entities/affiliation-code'

export interface AffiliationCodeRepository {
  create(affiliationCode: AffiliationCode): Promise<void>
  findByCode(code: string): Promise<AffiliationCode | null>
  delete(code: string): Promise<void>
}
