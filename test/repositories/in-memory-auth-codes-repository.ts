import type { AuthCodesRepository } from '@/domain/atlas-api/application/repositories/auth-codes-repository'
import type { Code } from '@/domain/atlas-api/enterprise/entities/code'

export class InMemoryAuthCodesRepository implements AuthCodesRepository {
  public items: Code[] = []

  async findById(code: string): Promise<Code | null> {
    const authCode = this.items.find((value) => value.code === code)
    if (!authCode) {
      return null
    }
    return authCode
  }

  async create(code: Code): Promise<void> {
    this.items.push(code)
  }

  async delete(code: string): Promise<void> {
    this.items = this.items.filter((item) => item.code !== code)
  }
}
