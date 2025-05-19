import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'

import { RegisterProviderUseCase } from './register-provider-use-case'
import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeProvider } from '@test/factories/make-provider'
import { InMemoryProviderRepository } from '@test/repositories/in-memory-provider-repository'

let inMemoryProviderRepository: InMemoryProviderRepository
let fakerHasher: FakeHasher
let sut: RegisterProviderUseCase

describe('Register Provider', () => {
  beforeEach(() => {
    inMemoryProviderRepository = new InMemoryProviderRepository()
    fakerHasher = new FakeHasher()

    sut = new RegisterProviderUseCase(inMemoryProviderRepository, fakerHasher)
  })

  it('should be able to register a new provider', async () => {
    const result = await sut.execute({
      name: 'john doe',
      cpf: '12345678909',
      email: 'johndoe@example.com',
      password: '123456',
      phone: '99999999999',
      duration: 60,
      providerCode: '543534',
      occupation: 'Medico',
      price: 4.5,
      birthday: new Date(),
      specialty: 'general clinic',
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryProviderRepository.items.length).toBe(1)
  })

  it('should hash student password upon registration', async () => {
    const result = await sut.execute({
      name: 'john doe',
      cpf: '12345678909',
      email: 'johndoe@example.com',
      duration: 60,
      providerCode: '543534',
      password: '123456',
      occupation: 'Medico',
      phone: '99999999999',
      price: 4.5,
      birthday: new Date(),
      specialty: 'general clinic',
    })
    const hashedPassword = await fakerHasher.hash('123456')

    expect(result.isRight()).toBe(true)
    expect(inMemoryProviderRepository.items[0].password).toEqual(hashedPassword)
  })

  it('It should not be possible to register a new provider, email already registered', async () => {
    const provider = makeProvider({
      email: 'johndoe@example.com',
      cpf: '12345678910',
      phone: '99999999998',
    })
    inMemoryProviderRepository.items.push(provider)

    const result1 = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      phone: '99999999999',
      birthday: new Date(),
      duration: 60,
      providerCode: '543534',
      price: 4.5,
      occupation: 'Medico',
      cpf: '12345678911',
      password: '123456',
      specialty: 'general clinic',
    })

    expect(result1.isLeft()).toBe(true)
    expect(result1.value).toBeInstanceOf(ResourceAlreadyExistsError)

    const result2 = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      cpf: '12345678911',
      phone: '99999999998',
      providerCode: '543534',
      duration: 60,
      occupation: 'Medico',
      password: '123456',
      price: 4.5,
      birthday: new Date(),
      specialty: 'general clinic',
    })

    expect(result2.isLeft()).toBe(true)
    expect(result2.value).toBeInstanceOf(ResourceAlreadyExistsError)

    const result3 = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      occupation: 'Medico',
      cpf: '12345678910',
      phone: '99999999999',
      providerCode: '543534',
      password: '123456',
      duration: 60,
      price: 4.5,
      birthday: new Date(),
      specialty: 'general clinic',
    })

    expect(result3.isLeft()).toBe(true)
    expect(result3.value).toBeInstanceOf(ResourceAlreadyExistsError)
  })
})
