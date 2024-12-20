import type { AuthCodesRepository } from '@/domain/atlas-api/application/repositories/auth-codes-repository'
import type { Code } from '@/domain/atlas-api/enterprise/entities/code'
import { AuthCodeMapper } from '../mappers/prisma-auth-code-mapper'
import type { PrismaClient } from '@prisma/client'

export class PrismaAuthCodeRepository implements AuthCodesRepository {
  constructor(private prisma: PrismaClient) {}
  async create(code: Code): Promise<void> {
    await this.prisma.authCodes.create({ data: AuthCodeMapper.toPrisma(code) })
  }

  async findById(code: string): Promise<Code | null> {
    const authCode = await this.prisma.authCodes.findUnique({ where: { code } })
    if (!authCode) {
      return null
    }
    return AuthCodeMapper.toDomain(authCode)
  }

  async delete(code: string): Promise<void> {
    await this.prisma.authCodes.delete({ where: { code } })
  }
}
