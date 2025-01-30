import { MockSendEmail } from '@test/email/mock-send-email'
import { makeProvider } from '@test/factories/make-provider'
import { InMemoryAuthCodesRepository } from '@test/repositories/in-memory-auth-codes-repository'
import { InMemoryProviderRepository } from '@test/repositories/in-memory-provider-repository'
import { ForgetPasswordUseCase } from './forget-password-use-case'
import { InMemoryInstitutionRepository } from '@test/repositories/in-memory-institution-repository'
import { InMemoryPatientRepository } from '@test/repositories/in-memory-patient-repository'

let inMemoryProviderRepository: InMemoryProviderRepository
let inMemoryInstitutionRepository: InMemoryInstitutionRepository
let inMemoryPatientRepository: InMemoryPatientRepository
let inMemoryAuthCodesRepository: InMemoryAuthCodesRepository
let mockSendEmail: MockSendEmail
let sut: ForgetPasswordUseCase

describe('Forgot Password', () => {
  beforeEach(() => {
    inMemoryProviderRepository = new InMemoryProviderRepository()
    inMemoryInstitutionRepository = new InMemoryInstitutionRepository()
    inMemoryPatientRepository = new InMemoryPatientRepository()
    inMemoryAuthCodesRepository = new InMemoryAuthCodesRepository()
    mockSendEmail = new MockSendEmail()

    sut = new ForgetPasswordUseCase(
      inMemoryProviderRepository,
      inMemoryInstitutionRepository,
      inMemoryPatientRepository,
      inMemoryAuthCodesRepository,
      mockSendEmail
    )
  })

  it('should be able to send for password recovery', async () => {
    const provider = makeProvider({
      email: 'johndoe@example.com',
    })
    inMemoryProviderRepository.items.push(provider)

    const result = await sut.execute({
      email: 'johndoe@example.com',
      URL_REDIRECT: 'http://localhost:3000',
      entity: 'PROVIDER',
    })

    expect(result.isRight()).toBe(true)
  })
})
