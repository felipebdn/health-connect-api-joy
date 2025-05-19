import type { ProviderInstitution, Prisma } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Affiliation } from '@/domain/atlas-api/enterprise/entities/affiliation'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PrismaAffiliationMapper {
  static toDomain(raw: ProviderInstitution): Affiliation {
    return Affiliation.create(
      {
        enrolledAt: raw.enrolledAt,
        institutionId: new UniqueEntityId(raw.institutionId),
        providerId: new UniqueEntityId(raw.providerId),
        status: raw.status,
      },
      new UniqueEntityId()
    )
  }

  static toPrisma(
    affiliation: Affiliation
  ): Prisma.ProviderInstitutionUncheckedCreateInput {
    return {
      institutionId: affiliation.institutionId.toString(),
      providerId: affiliation.providerId.toString(),
      enrolledAt: affiliation.enrolledAt,
      status: affiliation.status,
    }
  }
}
