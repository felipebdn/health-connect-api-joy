import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  type ProviderProps,
  Provider,
} from '@/domain/atlas-api/enterprise/entities/provider'
import { db } from '@/infra/db/connection'
import { DrizzleProviderMapper } from '@/infra/db/mappers/drizzle-provider-mapper'
import { ProviderDb } from '@/infra/db/schema'
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
    const providerCreated = makeProvider(data, id)
    await db
      .insert(ProviderDb)
      .values(DrizzleProviderMapper.toDrizzle(providerCreated))

    return providerCreated
  }
}
