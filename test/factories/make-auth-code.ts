import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  type CodeProps,
  Code,
} from '@/domain/atlas-api/enterprise/entities/code'
import { AuthCodeMapper } from '@/infra/db/mappers/prisma-auth-code-mapper'
import { getPrismaClient } from '@/infra/db/prisma'
import { createId } from '@paralleldrive/cuid2'

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
    const prisma = getPrismaClient()

    const authCodeCreated = makeAuthCode(data, id)
    await prisma.authCodes.create({
      data: AuthCodeMapper.toPrisma(authCodeCreated),
    })
    return authCodeCreated
  }
}
