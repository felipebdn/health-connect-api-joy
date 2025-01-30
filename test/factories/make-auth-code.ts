import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  type AuthCodeProps,
  AuthCode,
} from '@/domain/atlas-api/enterprise/entities/code'
import { AuthCodeMapper } from '@/infra/db/mappers/prisma-auth-code-mapper'
import { getPrismaClient } from '@/infra/db/prisma'
import { createId } from '@paralleldrive/cuid2'

export function makeAuthCode(
  override?: Partial<AuthCodeProps>,
  id?: UniqueEntityId
) {
  const authCode = AuthCode.create(
    {
      code: createId(),
      createdAt: new Date(),
      entity: 'PROVIDER',
      entityId: new UniqueEntityId(),
      ...override,
    },
    id
  )

  return authCode
}

export class AuthCodeFactory {
  async makePrismaAuthCode(data: Partial<AuthCodeProps>, id?: UniqueEntityId) {
    const prisma = getPrismaClient()

    const authCodeCreated = makeAuthCode(data, id)
    await prisma.authCode.create({
      data: AuthCodeMapper.toPrisma(authCodeCreated),
    })
    return authCodeCreated
  }
}
