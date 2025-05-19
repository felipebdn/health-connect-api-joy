import type { Prisma, Provider as PrismaProvider } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Provider } from '@/domain/atlas-api/enterprise/entities/provider'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PrismaProviderMapper {
  static toDomain(raw: PrismaProvider & { nextAvailability?: Date }): Provider {
    return Provider.create(
      {
        birthday: new Date(raw.birthday),
        cpf: raw.cpf,
        email: raw.email,
        name: raw.name,
        password: raw.password,
        nextAvailability: raw.nextAvailability,
        occupation: raw.occupation,
        phone: raw.phone,
        addressId: raw.addressId
          ? new UniqueEntityId(raw.addressId)
          : undefined,
        price: raw.price,
        specialty: raw.specialty,
        description: raw.description ?? undefined,
        education: raw.education ?? undefined,
        duration: raw.duration,
        providerCode: raw.providerCode,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(provider: Provider): Prisma.ProviderUncheckedCreateInput {
    return {
      id: provider.id.toValue(),
      birthday: provider.birthday.toISOString(),
      cpf: provider.cpf,
      email: provider.email,
      name: provider.name,
      password: provider.password,
      phone: provider.phone,
      providerCode: provider.providerCode,
      occupation: provider.occupation,
      price: provider.price,
      addressId: provider.addressId?.toValue(),
      duration: provider.duration,
      specialty: provider.specialty,
      description: provider.description,
      education: provider.education,
    }
  }
}
