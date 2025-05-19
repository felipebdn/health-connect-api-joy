import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'

import { FakeHasher } from '@test/cryptography/fake-hasher'
import { InMemoryPatientRepository } from '@test/repositories/in-memory-patient-repository'
import { RegisterPatientUseCase } from './register-patient-use-case'
import { makePatient } from '@test/factories/make-patient'

let inMemoryPatientRepository: InMemoryPatientRepository
let fakerHasher: FakeHasher
let sut: RegisterPatientUseCase

describe('Register Patient', () => {
  beforeEach(() => {
    inMemoryPatientRepository = new InMemoryPatientRepository()
    fakerHasher = new FakeHasher()

    sut = new RegisterPatientUseCase(inMemoryPatientRepository, fakerHasher)
  })

  it('should be able to register a new patient', async () => {
    const result = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      password: '123456',
      phone: '99999999999',
      birthday: new Date(),
      cpf: '1234567890',
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryPatientRepository.items.length).toBe(1)
  })

  it('should hash patient password upon registration', async () => {
    const result = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      password: '123456',
      phone: '99999999999',
      birthday: new Date(),
      cpf: '1234567890',
    })
    const hashedPassword = await fakerHasher.hash('123456')

    expect(result.isRight()).toBe(true)
    expect(inMemoryPatientRepository.items[0].password).toEqual(hashedPassword)
  })

  it('It should not be possible to register a new patient, email already registered', async () => {
    const patient = makePatient({
      email: 'johndoe@example.com',
      phone: '99999999998',
    })
    inMemoryPatientRepository.items.push(patient)

    const result1 = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      password: '123456',
      phone: '99999999959',
      birthday: new Date(),
      cpf: '123456789',
    })

    expect(result1.isLeft()).toBe(true)
    expect(result1.value).toBeInstanceOf(ResourceAlreadyExistsError)

    const result2 = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      phone: '99999999998',
      password: '123456',
      birthday: new Date(),
      cpf: '123456789',
    })

    expect(result2.isLeft()).toBe(true)
    expect(result2.value).toBeInstanceOf(ResourceAlreadyExistsError)

    const result3 = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      phone: '99999999999',
      password: '123456',
      birthday: new Date(),
      cpf: '1234567890',
    })

    expect(result3.isLeft()).toBe(true)
    expect(result3.value).toBeInstanceOf(ResourceAlreadyExistsError)
  })
})
