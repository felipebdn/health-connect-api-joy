import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'

import { Institution } from '../../enterprise/entities/institution'
import { type Either, left, right } from '@/core/either'
import type { HashGenerator } from '../cryptography/hash-generator'
import type { InstitutionRepository } from '../repositories/institution-repository'

interface RegisterInstitutionUseCaseRequest {
  name: string
  email: string
  phone: string
  password: string
}

type RegisterInstitutionUseCaseResponse = Either<
  ResourceAlreadyExistsError,
  unknown
>

export class RegisterInstitutionUseCase {
  constructor(
    private institutionRepository: InstitutionRepository,
    private hashGenerator: HashGenerator
  ) {}

  async execute(
    data: RegisterInstitutionUseCaseRequest
  ): Promise<RegisterInstitutionUseCaseResponse> {
    const isEmailProviderAlreadyExists =
      await this.institutionRepository.findByEmail(data.email)

    if (isEmailProviderAlreadyExists) {
      return left(new ResourceAlreadyExistsError('email'))
    }

    const isPhoneInstitutionAlreadyExists =
      await this.institutionRepository.findByPhone(data.phone)

    if (isPhoneInstitutionAlreadyExists) {
      return left(new ResourceAlreadyExistsError('phone'))
    }

    const hashedPassword = await this.hashGenerator.hash(data.password)

    const newInstitution = Institution.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      phone: data.phone,
    })

    await this.institutionRepository.create(newInstitution)

    return right({})
  }
}
