import { createId } from '@paralleldrive/cuid2'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Code,
  type CodeProps,
} from '@/domain/atlas-api/enterprise/entities/code'
import { db } from '@/infra/db/connection'
import { authCodesDb } from '@/infra/db/schema'
import { DrizzleAuthCodeMapper } from '@/infra/db/mappers/drizzle-auth-code-mapper'

export function makeAuthCode(
  override?: Partial<CodeProps>,
  id?: UniqueEntityId
) {
  const authCode = Code.create(
    {
      code: createId(),
      providerId: new UniqueEntityId(),
      createdAt: new Date(),
      ...override,
    },
    id
  )

  return authCode
}

export class AuthCodeFactory {
  async makePrismaAuthCode(data: Partial<CodeProps>, id?: UniqueEntityId) {
    const authCodeCreated = makeAuthCode(data, id)
    await db
      .insert(authCodesDb)
      .values(DrizzleAuthCodeMapper.toDrizzle(authCodeCreated))

    return authCodeCreated
  }
}
