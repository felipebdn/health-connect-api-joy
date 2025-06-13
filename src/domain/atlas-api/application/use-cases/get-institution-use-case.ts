import { left, right, type Either } from '@/core/either'
import type { InstitutionRepository } from '../repositories/institution-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { Institution } from '../../enterprise/entities/institution'

interface GetInstitutionUseCaseRequest {
  institutionId: string
}

type GetInstitutionUseCaseResponse = Either<
  ResourceNotFoundError,
  { institution: Institution }
>

export class GetInstitutionUseCase {
  constructor(private institutionRepository: InstitutionRepository) {}

  async execute(
    data: GetInstitutionUseCaseRequest
  ): Promise<GetInstitutionUseCaseResponse> {
    const institution = await this.institutionRepository.findById(
      data.institutionId
    )

    if (!institution) {
      return left(new ResourceNotFoundError('institution'))
    }

    return right({ institution })
  }
}
