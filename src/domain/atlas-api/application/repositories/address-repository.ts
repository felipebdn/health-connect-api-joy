import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Address } from '../../enterprise/entities/address'

export interface AddressRepository {
  create(address: Address): Promise<{ addressId: UniqueEntityId }>
  findById(addressId: string): Promise<Address | null>
  delete(addressId: string): Promise<void>
  save(data: Address): Promise<void>
}
