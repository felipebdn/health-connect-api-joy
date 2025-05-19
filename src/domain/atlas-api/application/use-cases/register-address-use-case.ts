import { type Either, left, right } from '@/core/either'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { InstitutionRepository } from '../repositories/institution-repository'
import type { PatientRepository } from '../repositories/patient-repository'
import type { Patient } from '../../enterprise/entities/patient'
import type { Institution } from '../../enterprise/entities/institution'
import type { Provider } from '../../enterprise/entities/provider'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Address } from '../../enterprise/entities/address'
import type { AddressRepository } from '../repositories/address-repository'
import { BadRequestError } from '@/infra/http/routes/_errors/bad-request-error'

type EntityMap = {
  PATIENT: Patient
  INSTITUTION: Institution
  PROVIDER: Provider
}

interface RegisterAddressUseCaseRequest {
  userId: string
  street: string
  number?: string
  district: string
  complement?: string
  zipCode: string
  city: string
  state: string
}

type RegisterAddressUseCaseResponse = Either<
  ResourceNotFoundError | BadRequestError,
  unknown
>

export class RegisterAddressUseCase {
  constructor(
    private providerRepository: ProviderRepository,
    private institutionRepository: InstitutionRepository,
    private patientRepository: PatientRepository,
    private addressRepository: AddressRepository
  ) {}

  async execute<T extends keyof EntityMap>(
    type: T,
    data: RegisterAddressUseCaseRequest
  ): Promise<RegisterAddressUseCaseResponse> {
    switch (type) {
      case 'PROVIDER': {
        const provider = await this.providerRepository.findById(data.userId)
        if (!provider) {
          return left(new ResourceNotFoundError('provider'))
        }
        const address = Address.create(data)

        provider.addressId = address.id

        await this.addressRepository.create(address)
        await this.providerRepository.save(provider)

        return right({})
      }
      case 'INSTITUTION': {
        const institution = await this.institutionRepository.findById(
          data.userId
        )
        if (!institution) {
          return left(new ResourceNotFoundError('institution'))
        }
        const address = Address.create(data)

        institution.addressId = address.id

        await this.addressRepository.create(address)
        await this.institutionRepository.save(institution)

        return right({})
      }
      case 'PATIENT': {
        const patient = await this.patientRepository.findById(data.userId)
        if (!patient) {
          return left(new ResourceNotFoundError('patient'))
        }
        const address = Address.create(data)

        patient.addressId = address.id

        await this.addressRepository.create(address)
        await this.patientRepository.save(patient)

        return right({})
      }
    }

    return left(new BadRequestError())
  }
}
