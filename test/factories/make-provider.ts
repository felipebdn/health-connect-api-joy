import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  type ProviderProps,
  Provider,
} from '@/domain/atlas-api/enterprise/entities/provider'
import { PrismaProviderMapper } from '@/infra/db/mappers/prisma-provider-mapper'
import { getPrismaClient } from '@/infra/db/prisma'
import { faker } from '@faker-js/faker'

export function makeProvider(
  override?: Partial<ProviderProps>,
  id?: UniqueEntityId
) {
  const provider = Provider.create(
    {
      cpf: faker.vehicle.vin(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      education: faker.person.jobArea(),
      password: faker.internet.password(),
      specialty: faker.person.jobType(),
      description: faker.person.bio(),
      birthday: faker.date.birthdate(),
      duration: faker.number.int({
        min: 60 * 30,
        max: 60 * 60,
      }),
      phone: faker.phone.number(),
      price: faker.number.int({
        min: 100,
        max: 1000,
      }),
      ...override,
    },
    id
  )

  return provider
}

export class ProviderFactory {
  async makePrismaProvider(data: Partial<ProviderProps>, id?: UniqueEntityId) {
    const prisma = getPrismaClient()
    const providerCreated = makeProvider(data, id)
    await prisma.provider.create({
      data: PrismaProviderMapper.toPrisma(providerCreated),
    })
    return providerCreated
  }
}
