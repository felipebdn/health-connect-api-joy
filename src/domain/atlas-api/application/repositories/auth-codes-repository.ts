import type { AuthCode } from '../../enterprise/entities/code'

export interface AuthCodesRepository {
  create(code: AuthCode): Promise<void>
  findById(code: string): Promise<AuthCode | null>
  delete(code: string): Promise<void>
}
