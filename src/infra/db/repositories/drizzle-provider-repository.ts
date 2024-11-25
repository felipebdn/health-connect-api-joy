import { eq } from 'drizzle-orm'
import type { ProviderCreate, ProviderType } from '../types'
import { db } from '../connection'
import type { ProviderRepository } from '@/domain/atlas-api/application/repositories/provider-repository'
import type { Provider } from '@/domain/atlas-api/enterprise/entities/provider'
import { ProviderDb } from '../schema'
import { DrizzleProviderMapper } from '../mappers/drizzle-provider-mapper'

export class DrizzleProviderRepository implements ProviderRepository {
  async create(provider: Provider): Promise<void> {
    await db
      .insert(ProviderDb)
      .values(DrizzleProviderMapper.toDrizzle(provider))
  }
  async save(provider: Provider): Promise<void> {
    await db.update(ProviderDb).set(DrizzleProviderMapper.toDrizzle(provider))
  }
  async delete(providerId: string): Promise<void> {
    await db.delete(ProviderDb).where(eq(ProviderDb.id, providerId))
  }
  async findById(id: string): Promise<Provider | null> {
    const provider = await db.query.ProviderDb.findFirst({
      where(fields, { eq }) {
        return eq(fields.id, id)
      },
    })
    if (!provider) return null
    return DrizzleProviderMapper.toDomain(provider)
  }
  async findByEmail(email: string): Promise<Provider | null> {
    const provider = await db.query.ProviderDb.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email)
      },
    })
    if (!provider) return null
    return DrizzleProviderMapper.toDomain(provider)
  }
  async findByCPF(cpf: string): Promise<Provider | null> {
    const provider = await db.query.ProviderDb.findFirst({
      where(fields, { eq }) {
        return eq(fields.cpf, cpf)
      },
    })
    if (!provider) return null
    return DrizzleProviderMapper.toDomain(provider)
  }
}
