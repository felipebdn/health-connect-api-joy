import { MockSendEmail } from 'tests/email/mock-send-email'
import { makeProvider } from 'tests/factories/make-provider'
import { InMemoryAuthCodesRepository } from 'tests/repositories/in-memory-auth-codes-repository'
import { InMemoryProviderRepository } from 'tests/repositories/in-memory-provider-repository'
import { ForgetPasswordUseCase } from './forget-password-use-case'

let inMemoryProviderRepository: InMemoryProviderRepository
let inMemoryAuthCodesRepository: InMemoryAuthCodesRepository
let mockSendEmail: MockSendEmail
let sut: ForgetPasswordUseCase

describe('Forgot Password', () => {
  beforeEach(() => {
    inMemoryProviderRepository = new InMemoryProviderRepository()
    inMemoryAuthCodesRepository = new InMemoryAuthCodesRepository()
    mockSendEmail = new MockSendEmail()

    sut = new ForgetPasswordUseCase(
      inMemoryProviderRepository,
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
    })

    expect(result.isRight()).toBe(true)
  })
})
