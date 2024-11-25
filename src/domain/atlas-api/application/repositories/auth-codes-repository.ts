import type { Code } from '../../enterprise/entities/code'

export interface AuthCodesRepository {
  create(code: Code): Promise<void>
  findById(code: string): Promise<Code | null>
  delete(code: string): Promise<void>
}
