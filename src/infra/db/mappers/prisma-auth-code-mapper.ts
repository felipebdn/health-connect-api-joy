import type { AuthCode, Prisma } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AuthCode as AuthCodeEntity } from '@/domain/atlas-api/enterprise/entities/code'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class AuthCodeMapper {
  static toDomain(raw: AuthCode): AuthCodeEntity {
    return AuthCodeEntity.create(
      {
        code: raw.code,
        createdAt: raw.createdAt,
        entity: raw.entity,
        entityId: new UniqueEntityId(raw.entityId),
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(
    authCode: AuthCodeEntity
  ): Prisma.AuthCodeUncheckedCreateInput {
    return {
      code: authCode.code,
      createdAt: authCode.createdAt,
      entity: authCode.entity,
      entityId: authCode.entityId.toString(),
      id: authCode.id.toValue(),
    }
  }
}
