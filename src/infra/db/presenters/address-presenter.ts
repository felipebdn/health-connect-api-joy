import type { Address } from '@/domain/atlas-api/enterprise/entities/address'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class AddressPresenter {
  static toHTTP(address: Address) {
    return {
      id: address.id.toString(),
      street: address.street,
      number: address.number,
      district: address.district,
      complement: address.complement,
      zipCode: address.zipCode,
      city: address.city,
      state: address.state,
      createdAt: address.createdAt,
    }
  }
}
