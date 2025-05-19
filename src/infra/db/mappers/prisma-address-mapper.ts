import type { Address, Prisma } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Address as AddressEntity } from '@/domain/atlas-api/enterprise/entities/address'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PrismaAddressMapper {
  static toDomain(raw: Address): AddressEntity {
    return AddressEntity.create(
      {
        city: raw.city,
        district: raw.district,
        state: raw.state,
        street: raw.street,
        zipCode: raw.zipCode,
        complement: raw.complement ?? undefined,
        createdAt: raw.createdAt,
        number: raw.number ?? undefined,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(address: AddressEntity): Prisma.AddressUncheckedCreateInput {
    return {
      id: address.id.toValue(),
      city: address.city,
      district: address.district,
      state: address.state,
      street: address.street,
      zipCode: address.zipCode,
      complement: address.complement,
      createdAt: address.createdAt,
      number: address.number,
    }
  }
}
