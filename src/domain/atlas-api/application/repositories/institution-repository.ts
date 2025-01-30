import type { Institution } from '../../enterprise/entities/institution'

export interface InstitutionRepository {
  create(institution: Institution): Promise<void>
  findById(institutionId: string): Promise<Institution | null>
  findByEmail(email: string): Promise<Institution | null>
  findByPhone(phone: string): Promise<Institution | null>
  delete(institutionId: string): Promise<void>
  save(data: Institution): Promise<void>
}
