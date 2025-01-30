import type { AuthCodesRepository } from '@/domain/atlas-api/application/repositories/auth-codes-repository'
import type { AuthCode } from '@/domain/atlas-api/enterprise/entities/code'
import { AuthCodeMapper } from '../mappers/prisma-auth-code-mapper'
import type { PrismaClient } from '@prisma/client'

export class PrismaAuthCodeRepository implements AuthCodesRepository {
  constructor(private prisma: PrismaClient) {}
  async create(code: AuthCode): Promise<void> {
    await this.prisma.authCode.create({ data: AuthCodeMapper.toPrisma(code) })
  }

  async findById(code: string): Promise<AuthCode | null> {
    const authCode = await this.prisma.authCode.findUnique({ where: { code } })
    if (!authCode) {
      return null
    }
    return AuthCodeMapper.toDomain(authCode)
  }

  async delete(code: string): Promise<void> {
    await this.prisma.authCode.delete({ where: { code } })
  }
}
