import type { AffiliationRepository } from '@/domain/atlas-api/application/repositories/affiliation-repository'
import type { Institution } from '@/domain/atlas-api/enterprise/entities/institution'
import type { Provider } from '@/domain/atlas-api/enterprise/entities/provider'
import type { PrismaClient } from '@prisma/client'
import { PrismaAffiliationMapper } from '../mappers/prisma-affiliation-mapper'
import { PrismaInstitutionMapper } from '../mappers/prisma-institution-mapper'
import { PrismaProviderMapper } from '../mappers/prisma-provider-mapper'
import type { Affiliation } from '@/domain/atlas-api/enterprise/entities/affiliation'

export class PrismaAffiliationRepository implements AffiliationRepository {
  constructor(private prisma: PrismaClient) {}
  async create(affiliation: Affiliation): Promise<void> {
    await this.prisma.providerInstitution.create({
      data: PrismaAffiliationMapper.toPrisma(affiliation),
    })
  }
  async save(affiliation: Affiliation): Promise<void> {
    await this.prisma.providerInstitution.update({
      data: PrismaAffiliationMapper.toPrisma(affiliation),
      where: {
        providerId_institutionId: {
          institutionId: affiliation.institutionId.toValue(),
          providerId: affiliation.providerId.toValue(),
        },
      },
    })
  }
  async delete(data: {
    providerId: string
    institutionId: string
  }): Promise<void> {
    await this.prisma.providerInstitution.delete({
      where: {
        providerId_institutionId: {
          institutionId: data.institutionId,
          providerId: data.providerId,
        },
      },
    })
  }
  async findByProviderAndInstitution(data: {
    providerId: string
    institutionId: string
  }): Promise<Affiliation | null> {
    const affiliation = await this.prisma.providerInstitution.findFirst({
      where: { institutionId: data.institutionId, providerId: data.providerId },
    })
    if (!affiliation) return null
    return PrismaAffiliationMapper.toDomain(affiliation)
  }
  async listAffiliationByProviderOrInstitution(data: {
    providerId?: string
    institutionId?: string
  }): Promise<
    { provider: Provider; institution: Institution; affiliation: Affiliation }[]
  > {
    if (!data.providerId && !data.institutionId) {
      return []
    }

    const affiliations = await this.prisma.providerInstitution.findMany({
      where: {
        ...(data.institutionId && { institutionId: data.institutionId }),
        ...(data.providerId && { providerId: data.providerId }),
      },
      include: { institution: true, provider: true },
    })

    return affiliations.map((item) => {
      return {
        affiliation: PrismaAffiliationMapper.toDomain(item),
        institution: PrismaInstitutionMapper.toDomain(item.institution),
        provider: PrismaProviderMapper.toDomain(item.provider),
      }
    })
  }
}
