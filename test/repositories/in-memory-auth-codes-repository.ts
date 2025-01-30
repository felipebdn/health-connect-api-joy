import type { AuthCodesRepository } from '@/domain/atlas-api/application/repositories/auth-codes-repository'
import type { AuthCode } from '@/domain/atlas-api/enterprise/entities/code'

export class InMemoryAuthCodesRepository implements AuthCodesRepository {
  public items: AuthCode[] = []

  async findById(code: string): Promise<AuthCode | null> {
    const authCode = this.items.find((value) => value.code === code)
    if (!authCode) {
      return null
    }
    return authCode
  }

  async create(code: AuthCode): Promise<void> {
    this.items.push(code)
  }

  async delete(code: string): Promise<void> {
    this.items = this.items.filter((item) => item.code !== code)
  }
}
