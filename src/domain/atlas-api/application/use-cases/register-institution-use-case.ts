import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'

import { Institution } from '../../enterprise/entities/institution'
import { type Either, left, right } from '@/core/either'
import type { HashGenerator } from '../cryptography/hash-generator'
import type { InstitutionRepository } from '../repositories/institution-repository'
import { Address } from '../../enterprise/entities/address'
import type { AddressRepository } from '../repositories/address-repository'

interface RegisterInstitutionUseCaseRequest {
  name: string
  email: string
  phone: string
  password: string
  institutionName: string
  cnpj: string
  address: {
    street: string
    number?: string
    district: string
    complement?: string
    zipCode: string
    city: string
    state: string
  }
}

type RegisterInstitutionUseCaseResponse = Either<
  ResourceAlreadyExistsError,
  unknown
>

export class RegisterInstitutionUseCase {
  constructor(
    private institutionRepository: InstitutionRepository,
    private addressRepository: AddressRepository,
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

    const isCNPJProviderAlreadyExists =
      await this.institutionRepository.findByCNPJ(data.cnpj)

    if (isCNPJProviderAlreadyExists) {
      return left(new ResourceAlreadyExistsError('cnpj'))
    }

    const hashedPassword = await this.hashGenerator.hash(data.password)

    const newAddress = Address.create({ ...data.address })

    const { addressId } = await this.addressRepository.create(newAddress)

    const newInstitution = Institution.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      phone: data.phone,
      addressId,
      cnpj: data.cnpj,
      institutionName: data.institutionName,
    })
    await this.institutionRepository.create(newInstitution)

    return right({})
  }
}
