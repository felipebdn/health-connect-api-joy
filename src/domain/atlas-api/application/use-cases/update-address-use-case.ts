import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { AddressRepository } from '../repositories/address-repository'

interface UpdateAddressUseCaseRequest {
  addressId: string
  userId: string
  street: string
  number?: string
  district: string
  complement?: string
  zipCode: string
  city: string
  state: string
}

type UpdateAddressUseCaseResponse = Either<ResourceNotFoundError, unknown>

export class UpdateAddressUseCase {
  constructor(private addressRepository: AddressRepository) {}

  async execute(
    data: UpdateAddressUseCaseRequest
  ): Promise<UpdateAddressUseCaseResponse> {
    const address = await this.addressRepository.findById(data.addressId)

    if (!address) {
      return left(new ResourceNotFoundError('address'))
    }

    address.city = data.city
    address.complement = data.complement
    address.district = data.district
    address.number = data.number
    address.state = data.state
    address.street = data.street
    address.zipCode = data.zipCode

    await this.addressRepository.save(address)

    return right({})
  }
}
