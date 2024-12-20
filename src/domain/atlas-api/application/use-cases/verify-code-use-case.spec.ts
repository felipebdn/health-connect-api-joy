import { createId } from '@paralleldrive/cuid2'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'

import { VerifyCodeUseCase } from './verify-code-use-case'
import { makeAuthCode } from '@test/factories/make-auth-code'
import { InMemoryAuthCodesRepository } from '@test/repositories/in-memory-auth-codes-repository'

let inMemoryAuthCodesRepository: InMemoryAuthCodesRepository
let sut: VerifyCodeUseCase

describe('Verify Auth Code', () => {
  beforeEach(() => {
    inMemoryAuthCodesRepository = new InMemoryAuthCodesRepository()

    sut = new VerifyCodeUseCase(inMemoryAuthCodesRepository)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to verify auth from code to recover password', async () => {
    const date = new Date(2024, 7, 1, 10, 50)
    vi.setSystemTime(date)

    const code = createId()

    const authCode = makeAuthCode(
      {
        code,
        createdAt: new Date(2024, 7, 1, 8, 50),
      },
      new UniqueEntityId('provider-01')
    )

    inMemoryAuthCodesRepository.items.push(authCode)

    const result = await sut.execute({
      code,
    })

    expect(result.isRight()).toBe(true)
  })
})
