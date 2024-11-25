import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Code } from '@/domain/atlas-api/enterprise/entities/code'
import type { CodeCreate, CodeType } from '../types'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class DrizzleAuthCodeMapper {
  static toDomain(raw: CodeType): Code {
    return Code.create(
      {
        code: raw.code,
        providerId: new UniqueEntityId(raw.providerId),
        createdAt: raw.createdAt,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toDrizzle(authCode: Code): CodeCreate {
    return {
      code: authCode.code,
      providerId: authCode.providerId.toValue(),
      createdAt: authCode.createdAt,
      id: authCode.id.toValue(),
    }
  }
}
