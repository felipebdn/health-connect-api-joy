import type { InstitutionRepository } from '@/domain/atlas-api/application/repositories/institution-repository'
import type { Institution } from '@/domain/atlas-api/enterprise/entities/institution'

export class InMemoryInstitutionRepository implements InstitutionRepository {
  public items: Institution[] = []

  async create(institution: Institution): Promise<void> {
    this.items.push(institution)
  }
  async findById(institutionId: string): Promise<Institution | null> {
    const institution = this.items.find(
      (item) => item.id.toValue() === institutionId
    )
    if (!institution) {
      return null
    }
    return institution
  }
  async findByEmail(email: string): Promise<Institution | null> {
    const institution = this.items.find((item) => item.email === email)
    if (!institution) {
      return null
    }
    return institution
  }
  async findByPhone(phone: string): Promise<Institution | null> {
    const institution = this.items.find((item) => item.phone === phone)
    if (!institution) {
      return null
    }
    return institution
  }
  async delete(institutionId: string): Promise<void> {
    const providerIndex = this.items.findIndex(
      (item) => item.id.toValue() === institutionId
    )
    this.items.splice(providerIndex, 1)
  }
  async save(institution: Institution): Promise<void> {
    const providerIndex = this.items.findIndex(
      (item) => item.id === institution.id
    )

    this.items[providerIndex] = institution
  }
}
