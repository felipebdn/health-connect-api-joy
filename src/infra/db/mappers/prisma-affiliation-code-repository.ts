import type {
  AffiliationCode as PrismaAffiliationCode,
  Prisma,
} from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AffiliationCode } from '@/domain/atlas-api/enterprise/entities/affiliation-code'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PrismaAffiliationCodeMapper {
  static toDomain(raw: PrismaAffiliationCode): AffiliationCode {
    return AffiliationCode.create(
      {
        code: raw.code,
        institutionId: new UniqueEntityId(raw.institutionId),
        providerId: new UniqueEntityId(raw.providerId),
        createdAt: raw.createdAt,
      },
      new UniqueEntityId()
    )
  }

  static toPrisma(
    affiliationCode: AffiliationCode
  ): Prisma.AffiliationCodeUncheckedCreateInput {
    return {
      code: affiliationCode.code,
      institutionId: affiliationCode.institutionId.toString(),
      providerId: affiliationCode.providerId.toString(),
      createdAt: affiliationCode.createdAt,
      id: affiliationCode.id.toString(),
    }
  }
}
