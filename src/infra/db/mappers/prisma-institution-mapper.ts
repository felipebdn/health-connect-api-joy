import type { Institution as PrismaInstitution, Prisma } from '@prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Institution } from '@/domain/atlas-api/enterprise/entities/institution'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PrismaInstitutionMapper {
  static toDomain(raw: PrismaInstitution): Institution {
    return Institution.create(
      {
        email: raw.email,
        name: raw.name,
        password: raw.password,
        phone: raw.phone ?? undefined,
        addressId: raw.addressId
          ? new UniqueEntityId(raw.addressId)
          : undefined,
        cnpj: raw.cnpj ?? undefined,
        createdAt: raw.createdAt,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(
    institution: Institution
  ): Prisma.InstitutionUncheckedCreateInput {
    return {
      id: institution.id.toValue(),
      email: institution.email,
      name: institution.name,
      password: institution.password,
      addressId: institution.addressId?.toValue(),
      cnpj: institution.cnpj,
      phone: institution.phone,
      createdAt: institution.createdAt,
    }
  }
}
