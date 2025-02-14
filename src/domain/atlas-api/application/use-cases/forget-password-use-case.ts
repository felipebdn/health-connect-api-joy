import { createId } from '@paralleldrive/cuid2'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { AuthCode } from '../../enterprise/entities/code'
import { type Either, left, right } from '@/core/either'
import type { RequestError } from '@/core/errors/request-error'
import type { AuthCodesRepository } from '../repositories/auth-codes-repository'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { EmailService } from '../services/email'
import type { InstitutionRepository } from '../repositories/institution-repository'
import type { PatientRepository } from '../repositories/patient-repository'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

interface ResetPasswordUseCaseRequest {
  email: string
  URL_REDIRECT: string
  entity: 'INSTITUTION' | 'PROVIDER' | 'PATIENT'
}

type ResetPasswordUseCaseResponse = Either<
  ResourceNotFoundError | RequestError,
  unknown
>

export class ForgetPasswordUseCase {
  constructor(
    private providerRepository: ProviderRepository,
    private institutionRepository: InstitutionRepository,
    private patientRepository: PatientRepository,
    private authCodesRepository: AuthCodesRepository,
    private emailService: EmailService
  ) {}

  async execute({
    email,
    URL_REDIRECT,
    entity,
  }: ResetPasswordUseCaseRequest): Promise<ResetPasswordUseCaseResponse> {
    let entityId = ''

    switch (entity) {
      case 'INSTITUTION': {
        const institution = await this.institutionRepository.findByEmail(email)
        if (!institution) return left(new ResourceNotFoundError('institution'))
        entityId = institution.id.toString()
        break
      }
      case 'PATIENT': {
        const patient = await this.patientRepository.findByEmail(email)
        if (!patient) return left(new ResourceNotFoundError('patient'))
        entityId = patient.id.toString()
        break
      }
      case 'PROVIDER': {
        const provider = await this.providerRepository.findByEmail(email)
        if (!provider) return left(new ResourceNotFoundError('provider'))
        entityId = provider.id.toString()
        break
      }
      default:
        break
    }

    const code = createId()

    const authCode = AuthCode.create({
      code,
      entity,
      entityId: new UniqueEntityId(entityId),
    })

    const authLink = new URL(`${URL_REDIRECT}/new-password`)
    authLink.searchParams.set('code', code)

    const sendEmailResult = await this.emailService.sendMessageForgetPassword({
      recovery_code: authLink.toString(),
      recovery_email: email,
    })
    if (sendEmailResult) await this.authCodesRepository.create(authCode)

    return right({})
  }
}
