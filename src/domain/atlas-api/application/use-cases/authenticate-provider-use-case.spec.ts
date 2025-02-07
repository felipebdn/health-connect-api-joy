import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeProvider } from '@test/factories/make-provider'
import { InMemoryProviderRepository } from '@test/repositories/in-memory-provider-repository'
import { InMemoryInstitutionRepository } from '@test/repositories/in-memory-institution-repository'
import { InMemoryPatientRepository } from '@test/repositories/in-memory-patient-repository'
import { AuthenticateUseCase } from './authenticate-provider-use-case'

let inMemoryProviderRepository: InMemoryProviderRepository
let inMemoryInstitutionRepository: InMemoryInstitutionRepository
let inMemoryPatientRepository: InMemoryPatientRepository
let fakeHasher: FakeHasher

let sut: AuthenticateUseCase

describe('Authenticate Student', () => {
  beforeEach(() => {
    inMemoryProviderRepository = new InMemoryProviderRepository()
    inMemoryInstitutionRepository = new InMemoryInstitutionRepository()
    inMemoryPatientRepository = new InMemoryPatientRepository()
    fakeHasher = new FakeHasher()

    sut = new AuthenticateUseCase(
      inMemoryProviderRepository,
      inMemoryInstitutionRepository,
      inMemoryPatientRepository,
      fakeHasher
    )
  })

  it('should be able to authenticate a student', async () => {
    const student = makeProvider({
      email: 'johndoe@example.com',
      password: await fakeHasher.hash('123456'),
    })

    inMemoryProviderRepository.items.push(student)

    const result = await sut.execute('PROVIDER', {
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      provider: expect.any(Object),
    })
  })
})
