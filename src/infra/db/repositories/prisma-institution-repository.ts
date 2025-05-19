import type { InstitutionRepository } from '@/domain/atlas-api/application/repositories/institution-repository'
import type { Institution } from '@/domain/atlas-api/enterprise/entities/institution'
import type { PrismaClient } from '@prisma/client'
import { PrismaInstitutionMapper } from '../mappers/prisma-institution-mapper'

export class PrismaInstitutionRepository implements InstitutionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(institution: Institution): Promise<void> {
    await this.prisma.institution.create({
      data: PrismaInstitutionMapper.toPrisma(institution),
    })
  }
  async findById(institutionId: string): Promise<Institution | null> {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    })
    return institution ? PrismaInstitutionMapper.toDomain(institution) : null
  }
  async findByEmail(email: string): Promise<Institution | null> {
    const institution = await this.prisma.institution.findUnique({
      where: { email },
    })
    return institution ? PrismaInstitutionMapper.toDomain(institution) : null
  }
  async findByCNPJ(cnpj: string): Promise<Institution | null> {
    const institution = await this.prisma.institution.findUnique({
      where: { cnpj },
    })
    return institution ? PrismaInstitutionMapper.toDomain(institution) : null
  }
  async findByPhone(phone: string): Promise<Institution | null> {
    const institution = await this.prisma.institution.findUnique({
      where: { phone },
    })
    return institution ? PrismaInstitutionMapper.toDomain(institution) : null
  }

  async delete(institutionId: string): Promise<void> {
    await this.prisma.institution.delete({ where: { id: institutionId } })
  }
  async save(data: Institution): Promise<void> {
    await this.prisma.institution.update({
      data: PrismaInstitutionMapper.toPrisma(data),
      where: { id: data.id.toValue() },
    })
  }
}
