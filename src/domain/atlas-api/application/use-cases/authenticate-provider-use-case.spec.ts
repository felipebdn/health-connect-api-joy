import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeProvider } from '@test/factories/make-provider'
import { InMemoryProviderRepository } from '@test/repositories/in-memory-provider-repository'
import { AuthenticateProviderUseCase } from './authenticate-provider-use-case'

let inMemoryProviderRepository: InMemoryProviderRepository
let fakeHasher: FakeHasher

let sut: AuthenticateProviderUseCase

describe('Authenticate Student', () => {
  beforeEach(() => {
    inMemoryProviderRepository = new InMemoryProviderRepository()
    fakeHasher = new FakeHasher()

    sut = new AuthenticateProviderUseCase(
      inMemoryProviderRepository,
      fakeHasher
    )
  })

  it('should be able to authenticate a student', async () => {
    const student = makeProvider({
      email: 'johndoe@example.com',
      password: await fakeHasher.hash('123456'),
    })

    inMemoryProviderRepository.items.push(student)

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      provider: expect.any(Object),
    })
  })
})
