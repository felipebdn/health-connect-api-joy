import type { AffiliationCodeRepository } from '@/domain/atlas-api/application/repositories/affiliation-code-repository'
import type { AffiliationCode } from '@/domain/atlas-api/enterprise/entities/affiliation-code'
import type { PrismaClient } from '@prisma/client'
import { PrismaAffiliationCodeMapper } from '../mappers/prisma-affiliation-code-repository'

export class PrismaAffiliationCodeRepository
  implements AffiliationCodeRepository
{
  constructor(private prisma: PrismaClient) {}

  async create(affiliationCode: AffiliationCode): Promise<void> {
    await this.prisma.affiliationCode.create({
      data: PrismaAffiliationCodeMapper.toPrisma(affiliationCode),
    })
  }
  async findByCode(code: string): Promise<AffiliationCode | null> {
    const affiliationCode = await this.prisma.affiliationCode.findUnique({
      where: { code },
    })

    if (!affiliationCode) return null

    return PrismaAffiliationCodeMapper.toDomain(affiliationCode)
  }
  async delete(code: string): Promise<void> {
    await this.prisma.affiliationCode.delete({ where: { code } })
  }
}
