import { createId } from '@paralleldrive/cuid2'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { Code } from '../../enterprise/entities/code'
import { type Either, left, right } from '@/core/either'
import type { RequestError } from '@/core/errors/request-error'
import type { AuthCodesRepository } from '../repositories/auth-codes-repository'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { EmailService } from '../services/email'

interface ResetPasswordUseCaseRequest {
  email: string
  URL_REDIRECT: string
}

type ResetPasswordUseCaseResponse = Either<
  ResourceNotFoundError | RequestError,
  unknown
>

export class ForgetPasswordUseCase {
  constructor(
    private providerRepository: ProviderRepository,
    private authCodesRepository: AuthCodesRepository,
    private emailService: EmailService
  ) {}

  async execute({
    email,
    URL_REDIRECT,
  }: ResetPasswordUseCaseRequest): Promise<ResetPasswordUseCaseResponse> {
    const provider = await this.providerRepository.findByEmail(email)

    if (!provider) {
      return left(new ResourceNotFoundError('email'))
    }

    const code = createId()

    const authCode = Code.create({ code, providerId: provider.id })

    const authLink = new URL(`${URL_REDIRECT}/new-password`)
    authLink.searchParams.set('code', code)

    const sendEmailResult = await this.emailService.sendMessageForgetPassword({
      recovery_code: authLink.toString(),
      recovery_email: provider.email,
    })
    if (sendEmailResult) {
      await this.authCodesRepository.create(authCode)
    }

    return right({})
  }
}
