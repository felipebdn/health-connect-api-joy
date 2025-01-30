import type { Patient as PrismaPatient, Prisma } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Patient } from '@/domain/atlas-api/enterprise/entities/patient'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PrismaPatientMapper {
  static toDomain(raw: PrismaPatient): Patient {
    return Patient.create(
      {
        birthday: raw.birthday,
        cpf: raw.cpf,
        email: raw.email,
        name: raw.name,
        password: raw.password,
        phone: raw.phone,
        addressId: raw.addressId
          ? new UniqueEntityId(raw.addressId)
          : undefined,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(patient: Patient): Prisma.PatientUncheckedCreateInput {
    return {
      id: patient.id.toValue(),
      birthday: patient.birthday,
      cpf: patient.cpf,
      email: patient.email,
      name: patient.name,
      password: patient.password,
      phone: patient.phone,
      addressId: patient.addressId?.toValue(),
    }
  }
}
