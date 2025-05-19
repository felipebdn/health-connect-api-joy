import type { PrismaClient } from '@prisma/client'
import type { AddressRepository } from '@/domain/atlas-api/application/repositories/address-repository'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { PrismaAddressMapper } from '../mappers/prisma-address-mapper'
import type { Address } from '@/domain/atlas-api/enterprise/entities/address'

export class PrismaAddressRepository implements AddressRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Address): Promise<{ addressId: UniqueEntityId }> {
    const address = await this.prisma.address.create({
      data: PrismaAddressMapper.toPrisma(data),
    })
    return { addressId: new UniqueEntityId(address.id) }
  }
  async findById(addressId: string): Promise<Address | null> {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    })
    if (!address) return null
    return PrismaAddressMapper.toDomain(address)
  }
  async delete(addressId: string): Promise<void> {
    await this.prisma.address.delete({ where: { id: addressId } })
  }
  async save(data: Address): Promise<void> {
    await this.prisma.address.update({
      data: PrismaAddressMapper.toPrisma(data),
      where: { id: data.id.toString() },
    })
  }
}
