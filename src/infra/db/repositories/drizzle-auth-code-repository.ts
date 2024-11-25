import { eq } from 'drizzle-orm'
import type { CodeCreate, CodeType } from '../types'
import { db } from '../connection'
import type { AuthCodesRepository } from '@/domain/atlas-api/application/repositories/auth-codes-repository'
import type { Code } from '@/domain/atlas-api/enterprise/entities/code'
import { authCodesDb } from '../schema'
import { DrizzleAuthCodeMapper } from '../mappers/drizzle-auth-code-mapper'

export class DrizzleAuthCodeRepository implements AuthCodesRepository {
  async create(code: Code): Promise<void> {
    await db.insert(authCodesDb).values(DrizzleAuthCodeMapper.toDrizzle(code))
  }
  async findById(code: string): Promise<Code | null> {
    const authCode = await db.query.authCodesDb.findFirst({
      where(fields, { eq }) {
        return eq(fields.code, code)
      },
    })
    if (!authCode) return null
    return DrizzleAuthCodeMapper.toDomain(authCode)
  }
  async delete(code: string): Promise<void> {
    await db.delete(authCodesDb).where(eq(authCodesDb.code, code))
  }
}
