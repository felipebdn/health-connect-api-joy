import { left, right, type Either } from '@/core/either'
import { WrongCredentialsError } from '../errors/wrong-credentials-error'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { HashComparer } from '../cryptography/hash-comparer'
import type { Provider } from '../../enterprise/entities/provider'
import type { Patient } from '../../enterprise/entities/patient'
import type { Institution } from '../../enterprise/entities/institution'
import type { InstitutionRepository } from '../repositories/institution-repository'
import type { PatientRepository } from '../repositories/patient-repository'

type EntityMap = {
  PATIENT: Patient
  INSTITUTION: Institution
  PROVIDER: Provider
}

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

type AuthenticateUseCaseResponse<T extends keyof EntityMap> = Either<
  WrongCredentialsError,
  { user: EntityMap[T] }
>

export class AuthenticateUseCase {
  constructor(
    private providerRepository: ProviderRepository,
    private institutionRepository: InstitutionRepository,
    private patientRepository: PatientRepository,
    private hashComparer: HashComparer
  ) {}

  async execute<T extends keyof EntityMap>(
    type: T,
    data: AuthenticateUseCaseRequest
  ): Promise<AuthenticateUseCaseResponse<T>> {
    switch (type) {
      case 'PROVIDER': {
        const provider = await this.providerRepository.findByEmail(data.email)
        if (!provider) {
          return left(new WrongCredentialsError())
        }
        const areTheyDifferentPassword = !(await this.verifyPassword(
          data.password,
          provider.password
        ))
        if (areTheyDifferentPassword) return left(new WrongCredentialsError())
        return right({
          user: provider,
        }) as unknown as AuthenticateUseCaseResponse<T>
      }
      case 'INSTITUTION': {
        const institution = await this.institutionRepository.findByEmail(
          data.email
        )
        if (!institution) {
          return left(new WrongCredentialsError())
        }
        const areTheyDifferentPassword = !(await this.verifyPassword(
          data.password,
          institution.password
        ))
        if (areTheyDifferentPassword) return left(new WrongCredentialsError())
        return right({
          user: institution,
        }) as unknown as AuthenticateUseCaseResponse<T>
      }
      case 'PATIENT': {
        const patient = await this.patientRepository.findByEmail(data.email)
        if (!patient) {
          return left(new WrongCredentialsError())
        }
        const areTheyDifferentPassword = !(await this.verifyPassword(
          data.password,
          patient.password
        ))
        if (areTheyDifferentPassword) return left(new WrongCredentialsError())
        return right({
          user: patient,
        }) as unknown as AuthenticateUseCaseResponse<T>
      }
    }

    return left(new WrongCredentialsError())
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const isSamePassword = await this.hashComparer.compare(password, hash)
    return isSamePassword
  }
}
