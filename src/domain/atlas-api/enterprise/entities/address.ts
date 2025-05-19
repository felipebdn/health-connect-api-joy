import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export interface AddressProps {
  street: string
  number?: string
  district: string
  complement?: string
  zipCode: string
  city: string
  state: string
  createdAt: Date
}

export class Address extends Entity<AddressProps> {
  get street() {
    return this.props.street
  }

  get number() {
    return this.props.number
  }

  get district() {
    return this.props.district
  }

  get complement() {
    return this.props.complement
  }

  get zipCode() {
    return this.props.zipCode
  }

  get city() {
    return this.props.city
  }

  get state() {
    return this.props.state
  }

  get createdAt() {
    return this.props.createdAt
  }

  set street(street: string) {
    this.props.street = street
  }

  set state(state: string) {
    this.props.state = state
  }

  set number(number: string | undefined) {
    this.props.number = number
  }

  set complement(complement: string | undefined) {
    this.props.complement = complement
  }

  set city(city: string) {
    this.props.city = city
  }

  set district(district: string) {
    this.props.district = district
  }

  set zipCode(zipCode: string) {
    this.props.zipCode = zipCode
  }

  static create(
    props: Optional<AddressProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const address = new Address({ ...props, createdAt: new Date() }, id)

    return address
  }
}
