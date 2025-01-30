import dayjs from 'dayjs'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { UnauthorizedError } from '@/core/errors/unauthorized-error'

import { ConflictActionError } from './errors/conflit-errror-action'
import { type Either, left, right } from '@/core/either'
import type { HashComparer } from '../cryptography/hash-comparer'
import type { HashGenerator } from '../cryptography/hash-generator'
import type { AuthCodesRepository } from '../repositories/auth-codes-repository'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { InstitutionRepository } from '../repositories/institution-repository'
import type { PatientRepository } from '../repositories/patient-repository'

interface NewPasswordUseCaseRequest {
  code: string
  password: string
}

type NewPasswordUseCaseResponse = Either<
  UnauthorizedError | ResourceNotFoundError | ConflictActionError,
  unknown
>

export class NewPasswordUseCase {
  constructor(
    private providerRepository: ProviderRepository,
    private institutionRepository: InstitutionRepository,
    private patientRepository: PatientRepository,
    private authCodesRepository: AuthCodesRepository,
    private hasher: HashGenerator,
    private hashComparer: HashComparer
  ) {}

  async execute(
    data: NewPasswordUseCaseRequest
  ): Promise<NewPasswordUseCaseResponse> {
    const codeEntity = await this.authCodesRepository.findById(data.code)

    if (!codeEntity) {
      return left(new UnauthorizedError())
    }

    if (dayjs().diff(codeEntity.createdAt, 'minutes') > 120) {
      return left(new UnauthorizedError())
    }

    if (codeEntity.entity === 'INSTITUTION') {
      const institution = await this.institutionRepository.findById(
        codeEntity.entityId.toString()
      )
      if (!institution) {
        return left(new ResourceNotFoundError('institution'))
      }
      const isSamePassword = await this.hashComparer.compare(
        data.password,
        institution.password
      )
      if (isSamePassword) {
        return left(new ConflictActionError('password'))
      }
      institution.password = await this.hasher.hash(data.password)
      await this.institutionRepository.save(institution)
      await this.authCodesRepository.delete(codeEntity.code)
    }
    if (codeEntity.entity === 'PATIENT') {
      const patient = await this.patientRepository.findById(
        codeEntity.entityId.toString()
      )
      if (!patient) {
        return left(new ResourceNotFoundError('patient'))
      }
      const isSamePassword = await this.hashComparer.compare(
        data.password,
        patient.password
      )
      if (isSamePassword) {
        return left(new ConflictActionError('password'))
      }
      patient.password = await this.hasher.hash(data.password)
      await this.patientRepository.save(patient)
      await this.authCodesRepository.delete(codeEntity.code)
    }
    if (codeEntity.entity === 'PROVIDER') {
      const provider = await this.providerRepository.findById(
        codeEntity.entityId.toString()
      )
      if (!provider) {
        return left(new ResourceNotFoundError('provider'))
      }
      const isSamePassword = await this.hashComparer.compare(
        data.password,
        provider.password
      )
      if (isSamePassword) {
        return left(new ConflictActionError('password'))
      }
      provider.password = await this.hasher.hash(data.password)
      await this.providerRepository.save(provider)
      await this.authCodesRepository.delete(codeEntity.code)
    }

    return right({})
  }
}
