import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'

import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeProvider } from '@test/factories/make-provider'
import { InMemoryInstitutionRepository } from '@test/repositories/in-memory-institution-repository'
import { RegisterInstitutionUseCase } from './register-institution-use-case'
import { makeInstitution } from '@test/factories/make-institution'

let inMemoryInstitutionRepository: InMemoryInstitutionRepository
let fakerHasher: FakeHasher
let sut: RegisterInstitutionUseCase

describe('Register Institution', () => {
  beforeEach(() => {
    inMemoryInstitutionRepository = new InMemoryInstitutionRepository()
    fakerHasher = new FakeHasher()

    sut = new RegisterInstitutionUseCase(
      inMemoryInstitutionRepository,
      fakerHasher
    )
  })

  it('should be able to register a new institution', async () => {
    const result = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      password: '123456',
      phone: '99999999999',
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryInstitutionRepository.items.length).toBe(1)
  })

  it('should hash institution password upon registration', async () => {
    const result = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      password: '123456',
      phone: '99999999999',
    })
    const hashedPassword = await fakerHasher.hash('123456')

    expect(result.isRight()).toBe(true)
    expect(inMemoryInstitutionRepository.items[0].password).toEqual(
      hashedPassword
    )
  })

  it('It should not be possible to register a new institution, email already registered', async () => {
    const institution = makeInstitution({
      email: 'johndoe@example.com',
      phone: '99999999998',
    })
    inMemoryInstitutionRepository.items.push(institution)

    const result1 = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      password: '123456',
      phone: '99999999959',
    })

    expect(result1.isLeft()).toBe(true)
    expect(result1.value).toBeInstanceOf(ResourceAlreadyExistsError)

    const result2 = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      phone: '99999999998',
      password: '123456',
    })

    expect(result2.isLeft()).toBe(true)
    expect(result2.value).toBeInstanceOf(ResourceAlreadyExistsError)

    const result3 = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      phone: '99999999999',
      password: '123456',
    })

    expect(result3.isLeft()).toBe(true)
    expect(result3.value).toBeInstanceOf(ResourceAlreadyExistsError)
  })
})
