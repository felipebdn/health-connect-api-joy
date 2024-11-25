import { createId } from '@paralleldrive/cuid2'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

import { NewPasswordUseCase } from './new-password-use-case'
import { FakeHasher } from 'tests/cryptography/fake-hasher'
import { makeAuthCode } from 'tests/factories/make-auth-code'
import { makeProvider } from 'tests/factories/make-provider'
import { InMemoryAuthCodesRepository } from 'tests/repositories/in-memory-auth-codes-repository'
import { InMemoryProviderRepository } from 'tests/repositories/in-memory-provider-repository'

let inMemoryProviderRepository: InMemoryProviderRepository
let inMemoryAuthCodesRepository: InMemoryAuthCodesRepository
let fakeHasher: FakeHasher
let sut: NewPasswordUseCase

describe('New Password', () => {
  beforeEach(() => {
    inMemoryProviderRepository = new InMemoryProviderRepository()
    inMemoryAuthCodesRepository = new InMemoryAuthCodesRepository()
    fakeHasher = new FakeHasher()

    sut = new NewPasswordUseCase(
      inMemoryProviderRepository,
      inMemoryAuthCodesRepository,
      fakeHasher,
      fakeHasher
    )

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to change password', async () => {
    const date = new Date(2024, 7, 1, 10, 40)

    vi.setSystemTime(date)

    const provider = makeProvider(
      {
        password: await fakeHasher.hash('teste-123'),
      },
      new UniqueEntityId('provider-01')
    )

    inMemoryProviderRepository.items.push(provider)

    const code = createId()

    const authCode = makeAuthCode(
      {
        code,
        providerId: provider.id,
        createdAt: new Date(2024, 7, 1, 8, 50),
      },
      new UniqueEntityId('code-01')
    )

    inMemoryAuthCodesRepository.items.push(authCode)

    const result = await sut.execute({
      code,
      password: 'teste-1234',
    })

    expect(result.isRight()).toBe(true)
  })
})
