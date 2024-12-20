import type { authCodes as AuthCode, Prisma } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Code } from '@/domain/atlas-api/enterprise/entities/code'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class AuthCodeMapper {
  static toDomain(raw: AuthCode): Code {
    return Code.create(
      {
        code: raw.code,
        providerId: new UniqueEntityId(raw.providerId),
        createdAt: raw.createdAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(authCode: Code): Prisma.authCodesUncheckedCreateInput {
    return {
      code: authCode.code,
      providerId: authCode.providerId.toValue(),
      createdAt: authCode.createdAt,
      id: authCode.id.toValue(),
    }
  }
}
