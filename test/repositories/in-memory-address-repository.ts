import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { AddressRepository } from '@/domain/atlas-api/application/repositories/address-repository'
import type { Address } from '@/domain/atlas-api/enterprise/entities/address'

export class InMemoryAddressRepository implements AddressRepository {
  public items: Address[] = []

  async create(address: Address): Promise<{ addressId: UniqueEntityId }> {
    this.items.push(address)
    return { addressId: address.id }
  }

  async save(address: Address): Promise<void> {
    const addressIndex = this.items.findIndex((item) => item.id === address.id)

    this.items[addressIndex] = address
  }

  async delete(addressId: string): Promise<void> {
    const addressIndex = this.items.findIndex(
      (item) => item.id.toValue() === addressId
    )
    this.items.splice(addressIndex, 1)
  }

  async findById(addressId: string): Promise<Address | null> {
    const address = this.items.find((item) => item.id.toValue() === addressId)
    if (!address) {
      return null
    }
    return address
  }
}
