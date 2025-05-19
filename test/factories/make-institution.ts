import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  type InstitutionProps,
  Institution,
} from '@/domain/atlas-api/enterprise/entities/institution'
import { PrismaInstitutionMapper } from '@/infra/db/mappers/prisma-institution-mapper'
import { getPrismaClient } from '@/infra/db/prisma'
import { faker } from '@faker-js/faker'

export function makeInstitution(
  override?: Partial<InstitutionProps>,
  id?: UniqueEntityId
) {
  const institution = Institution.create(
    {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: faker.internet.password(),
      phone: faker.phone.number(),
      institutionName: faker.person.firstName(),
      ...override,
    },
    id
  )

  return institution
}

export class InstitutionFactory {
  async makePrismaInstitution(
    data: Partial<InstitutionProps>,
    id?: UniqueEntityId
  ) {
    const prisma = getPrismaClient()
    const institutionCreated = makeInstitution(data, id)
    await prisma.institution.create({
      data: PrismaInstitutionMapper.toPrisma(institutionCreated),
    })
    return institutionCreated
  }
}
