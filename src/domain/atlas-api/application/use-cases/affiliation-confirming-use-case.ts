import { left, right, type Either } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { AffiliationCodeRepository } from '../repositories/affiliation-code-repository'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { InstitutionRepository } from '../repositories/institution-repository'
import { BadRequestError } from '@/infra/http/routes/_errors/bad-request-error'
import dayjs from 'dayjs'
import type { AffiliationRepository } from '../repositories/affiliation-repository'
import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'
import { Affiliation } from '../../enterprise/entities/affiliation'
import type { Provider } from '../../enterprise/entities/provider'
import type { Institution } from '../../enterprise/entities/institution'

interface AffiliationConfirmingUseCaseRequest {
  code: string
}

type AffiliationConfirmingUseCaseResponse = Either<
  ResourceNotFoundError | BadRequestError | ResourceAlreadyExistsError,
  { provider: Provider; institution: Institution }
>

export class AffiliationConfirmingUseCase {
  constructor(
    private affiliationCodeRepository: AffiliationCodeRepository,
    private providerRepository: ProviderRepository,
    private institutionRepository: InstitutionRepository,
    private affiliation: AffiliationRepository
  ) {}

  async execute(
    data: AffiliationConfirmingUseCaseRequest
  ): Promise<AffiliationConfirmingUseCaseResponse> {
    const affiliationCode = await this.affiliationCodeRepository.findByCode(
      data.code
    )

    if (!affiliationCode) {
      return left(new BadRequestError('code expired or invalid'))
    }

    const expirationDate = dayjs(affiliationCode.createdAt).add(7, 'days')

    const isExpired = dayjs().isAfter(expirationDate)

    if (isExpired) {
      return left(new BadRequestError('code expired or invalid'))
    }

    const provider = await this.providerRepository.findById(
      affiliationCode.providerId.toValue()
    )

    if (!provider) {
      return left(new ResourceNotFoundError('provider'))
    }

    const institution = await this.institutionRepository.findById(
      affiliationCode.institutionId.toValue()
    )

    if (!institution) {
      return left(new ResourceNotFoundError('institution'))
    }

    const affiliation = await this.affiliation.findByProviderAndInstitution({
      institutionId: institution.id.toValue(),
      providerId: provider.id.toValue(),
    })

    if (affiliation) {
      return left(new ResourceAlreadyExistsError('affiliation'))
    }

    const newAffiliation = Affiliation.create({
      enrolledAt: new Date(),
      institutionId: institution.id,
      providerId: provider.id,
      status: 'ACTIVE',
    })

    await this.affiliation.create(newAffiliation)
    await this.affiliationCodeRepository.delete(affiliationCode.code)

    return right({ provider, institution })
  }
}
