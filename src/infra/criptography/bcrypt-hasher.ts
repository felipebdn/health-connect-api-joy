import type { HashComparer } from '@/domain/atlas-api/application/cryptography/hash-comparer'
import type { HashGenerator } from '@/domain/atlas-api/application/cryptography/hash-generator'
import bcryptjs from 'bcryptjs'

export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGTH = 8

  hash(plain: string): Promise<string> {
    return bcryptjs.hash(plain, this.HASH_SALT_LENGTH)
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(plain, hash)
  }
}
