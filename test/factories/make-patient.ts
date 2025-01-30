import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  type PatientProps,
  Patient,
} from '@/domain/atlas-api/enterprise/entities/patient'
import { PrismaPatientMapper } from '@/infra/db/mappers/prisma-patient-mapper'
import { getPrismaClient } from '@/infra/db/prisma'
import { faker } from '@faker-js/faker'

export function makePatient(
  override?: Partial<PatientProps>,
  id?: UniqueEntityId
) {
  const patient = Patient.create(
    {
      birthday: faker.date.birthdate(),
      cpf: faker.vehicle.vin(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: faker.internet.password(),
      phone: faker.phone.number(),
      addressId: new UniqueEntityId(),
      ...override,
    },
    id
  )

  return patient
}

export class PatientFactory {
  async makePrismaPatient(data: Partial<PatientProps>, id?: UniqueEntityId) {
    const prisma = getPrismaClient()
    const patientCreated = makePatient(data, id)
    await prisma.patient.create({
      data: PrismaPatientMapper.toPrisma(patientCreated),
    })
    return patientCreated
  }
}
