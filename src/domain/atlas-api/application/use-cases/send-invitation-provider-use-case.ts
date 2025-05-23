import { left, right, type Either } from '@/core/either'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { InstitutionRepository } from '../repositories/institution-repository'
import type { AffiliationRepository } from '../repositories/affiliation-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { BadRequestError } from '@/infra/http/routes/_errors/bad-request-error'
import type { EmailService } from '../services/email'
import { sendInvitationTemplate } from '@/lib/email-templates'
import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'
import { createId } from '@paralleldrive/cuid2'
import { env } from '@/env'
import type { AffiliationCodeRepository } from '../repositories/affiliation-code-repository'
import { AffiliationCode } from '../../enterprise/entities/affiliation-code'

interface SendInvitationProviderUseCaseRequest {
  institutionId: string
  emailProvider: string
}

type SendInvitationProviderUseCaseResponse = Either<
  ResourceNotFoundError | BadRequestError | ResourceAlreadyExistsError,
  unknown
>

export class SendInvitationProviderUseCase {
  constructor(
    private providerRepository: ProviderRepository,
    private institutionRepository: InstitutionRepository,
    private affiliationRepository: AffiliationRepository,
    private affiliationCode: AffiliationCodeRepository,
    private emailService: EmailService
  ) {}

  async execute(
    data: SendInvitationProviderUseCaseRequest
  ): Promise<SendInvitationProviderUseCaseResponse> {
    const provider = await this.providerRepository.findByEmail(
      data.emailProvider
    )

    if (!provider) {
      return left(new ResourceNotFoundError('provider'))
    }

    const institution = await this.institutionRepository.findById(
      data.institutionId
    )

    if (!institution) {
      return left(new ResourceNotFoundError('institution'))
    }

    const isAffiliationAlreadyExists =
      await this.affiliationRepository.findByProviderAndInstitution({
        institutionId: data.institutionId,
        providerId: provider.id.toValue(),
      })

    if (isAffiliationAlreadyExists) {
      return left(new ResourceAlreadyExistsError('affiliation'))
    }

    const affiliationCode = AffiliationCode.create({
      code: createId(),
      institutionId: institution.id,
      providerId: provider.id,
    })

    await this.affiliationCode.create(affiliationCode)

    const { code, message } = await this.emailService.sendEmail({
      from: 'contact@seuatlas.com.br',
      html: sendInvitationTemplate({
        institution_name: institution.institutionName,
        platform_name: 'Atlas',
        provider_name: provider.name,
        to_accept: `${env.BASE_URL_FRONT}/confirm-invitation?token=${affiliationCode.code}`,
      }),
      subject: 'Convite de vínculo',
      to: provider.email,
    })

    if (code === 400) {
      return left(new BadRequestError(message))
    }

    return right({})
  }
}
