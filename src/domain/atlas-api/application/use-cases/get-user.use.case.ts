import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { Provider } from '../../enterprise/entities/provider'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { PatientRepository } from '../repositories/patient-repository'
import type { InstitutionRepository } from '../repositories/institution-repository'

interface GetUserUseCaseRequest {
  userId: string
  role: 'PROVIDER' | 'PATIENT' | 'INSTITUTION'
}

type GetUserUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    user: {
      id: string
      name: string
      role: 'PROVIDER' | 'PATIENT' | 'INSTITUTION'
      duration?: number
    }
  }
>

export class GetUserUseCase {
  constructor(
    private providerRepository: ProviderRepository,
    private patientRepository: PatientRepository,
    private institutionRepository: InstitutionRepository
  ) {}

  async execute({
    userId,
    role,
  }: GetUserUseCaseRequest): Promise<GetUserUseCaseResponse> {
    switch (role) {
      case 'INSTITUTION': {
        const institution = await this.institutionRepository.findById(userId)
        if (!institution) return left(new ResourceNotFoundError('institution'))
        return right({
          user: { id: institution.id.toString(), name: institution.name, role },
        })
      }
      case 'PATIENT': {
        const patient = await this.patientRepository.findById(userId)
        if (!patient) return left(new ResourceNotFoundError('patient'))
        return right({
          user: { id: patient.id.toString(), name: patient.name, role },
        })
      }
      case 'PROVIDER': {
        const provider = await this.providerRepository.findById(userId)
        if (!provider) return left(new ResourceNotFoundError('provider'))
        return right({
          user: {
            id: provider.id.toString(),
            name: provider.name,
            role,
            duration: provider.duration,
          },
        })
      }
      default:
        return left(new ResourceNotFoundError('institution'))
    }
  }
}
