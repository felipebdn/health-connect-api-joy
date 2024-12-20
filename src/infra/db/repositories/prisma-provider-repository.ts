import type { ProviderRepository } from '@/domain/atlas-api/application/repositories/provider-repository'
import { getPrismaClient } from '../prisma'
import type { Provider } from '@/domain/atlas-api/enterprise/entities/provider'
import { PrismaProviderMapper } from '../mappers/prisma-provider-mapper'
import type { PrismaClient } from '@prisma/client'

export class PrismaProviderRepository implements ProviderRepository {
  constructor(private prisma: PrismaClient) {}

  async create(provider: Provider) {
    await this.prisma.provider.create({
      data: PrismaProviderMapper.toPrisma(provider),
    })
  }

  async save(provider: Provider) {
    await this.prisma.provider.update({
      data: PrismaProviderMapper.toPrisma(provider),
      where: {
        id: provider.id.toValue(),
      },
    })
  }

  async delete(providerId: string) {
    await this.prisma.provider.delete({
      where: {
        id: providerId,
      },
    })
  }

  async findByFilter(data: {
    name?: string
    specialty?: string
    amount?: number
    page?: number
  }): Promise<Provider[]> {
    const providers = await this.prisma.provider.findMany({
      where: {
        ...(data.name && {
          name: { contains: data.name, mode: 'insensitive' },
        }),
        ...(data.specialty && {
          specialty: data.specialty,
        }),
      },
      take: data.amount,
      skip: data.page ? data.page * (data.amount ?? 20) : undefined,
      orderBy: { name: 'asc' },
    })

    return providers.map((item) => PrismaProviderMapper.toDomain(item))
  }

  async findById(id: string): Promise<Provider | null> {
    const providerResult = await this.prisma.provider.findUnique({
      where: {
        id,
      },
    })
    return providerResult ? PrismaProviderMapper.toDomain(providerResult) : null
  }

  async findByEmail(email: string) {
    const providerResult = await this.prisma.provider.findUnique({
      where: {
        email,
      },
    })
    return providerResult ? PrismaProviderMapper.toDomain(providerResult) : null
  }

  async findByCPF(cpf: string) {
    const providerResult = await this.prisma.provider.findUnique({
      where: {
        cpf,
      },
    })
    return providerResult ? PrismaProviderMapper.toDomain(providerResult) : null
  }
}
