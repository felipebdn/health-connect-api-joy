import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'

import { FakeHasher } from '@test/cryptography/fake-hasher'
import { makeProvider } from '@test/factories/make-provider'
import { InMemoryInstitutionRepository } from '@test/repositories/in-memory-institution-repository'
import { RegisterInstitutionUseCase } from './register-institution-use-case'
import { makeInstitution } from '@test/factories/make-institution'
import { InMemoryAddressRepository } from '@test/repositories/in-memory-address-repository'

let inMemoryInstitutionRepository: InMemoryInstitutionRepository
let inMemoryAddressRepository: InMemoryAddressRepository
let fakerHasher: FakeHasher
let sut: RegisterInstitutionUseCase

describe('Register Institution', () => {
  beforeEach(() => {
    inMemoryInstitutionRepository = new InMemoryInstitutionRepository()
    inMemoryAddressRepository = new InMemoryAddressRepository()
    fakerHasher = new FakeHasher()

    sut = new RegisterInstitutionUseCase(
      inMemoryInstitutionRepository,
      inMemoryAddressRepository,
      fakerHasher
    )
  })

  it('should be able to register a new institution', async () => {
    const result = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      password: '123456',
      phone: '99999999999',
      cnpj: '42348274923',
      institutionName: 'example',
      address: {
        city: 'example',
        district: 'example',
        state: 'example',
        street: 'example',
        zipCode: '0000000',
      },
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
      cnpj: '42348274923',
      institutionName: 'example',
      address: {
        city: 'example',
        district: 'example',
        state: 'example',
        street: 'example',
        zipCode: '0000000',
      },
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
      cnpj: '42348274923',
      institutionName: 'example',
      address: {
        city: 'example',
        district: 'example',
        state: 'example',
        street: 'example',
        zipCode: '0000000',
      },
    })

    expect(result1.isLeft()).toBe(true)
    expect(result1.value).toBeInstanceOf(ResourceAlreadyExistsError)

    const result2 = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      phone: '99999999998',
      password: '123456',
      cnpj: '42348274923',
      institutionName: 'example',
      address: {
        city: 'example',
        district: 'example',
        state: 'example',
        street: 'example',
        zipCode: '0000000',
      },
    })

    expect(result2.isLeft()).toBe(true)
    expect(result2.value).toBeInstanceOf(ResourceAlreadyExistsError)

    const result3 = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      phone: '99999999999',
      password: '123456',
      cnpj: '42348274923',
      institutionName: 'example',
      address: {
        city: 'example',
        district: 'example',
        state: 'example',
        street: 'example',
        zipCode: '0000000',
      },
    })

    expect(result3.isLeft()).toBe(true)
    expect(result3.value).toBeInstanceOf(ResourceAlreadyExistsError)
  })
})
