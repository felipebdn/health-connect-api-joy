import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

export interface ProviderProps {
  name: string
  email: string
  cpf: string
  password: string
  phone: string
  duration: number
  providerCode: string
  nextAvailability?: Date
  birthday: Date
  occupation: string
  specialty: string
  price: number
  education?: string
  description?: string
  addressId?: UniqueEntityId
}

export class Provider extends Entity<ProviderProps> {
  get name() {
    return this.props.name
  }

  get nextAvailability() {
    return this.props.nextAvailability
  }

  get email() {
    return this.props.email
  }

  get cpf() {
    return this.props.cpf
  }

  get providerCode() {
    return this.props.providerCode
  }

  get phone() {
    return this.props.phone
  }

  get duration() {
    return this.props.duration
  }

  get password() {
    return this.props.password
  }

  get birthday() {
    return this.props.birthday
  }

  get price() {
    return this.props.price
  }

  get specialty() {
    return this.props.specialty
  }

  get occupation() {
    return this.props.occupation
  }

  get education() {
    return this.props.education
  }

  get description() {
    return this.props.description
  }

  get addressId(): UniqueEntityId | undefined {
    return this.props.addressId
  }

  set duration(duration: number) {
    this.props.duration = duration
  }

  set birthday(birthday: Date) {
    this.props.birthday = birthday
  }

  set name(name: string) {
    this.props.name = name
  }

  set phone(phone: string) {
    this.props.phone = phone
  }

  set price(price: number) {
    this.props.price = price
  }

  set addressId(addressId: UniqueEntityId) {
    this.props.addressId = addressId
  }

  set specialty(specialty: string) {
    this.props.specialty = specialty
  }

  set occupation(occupation: string) {
    this.props.occupation = occupation
  }

  set description(description: string | undefined) {
    this.props.description = description
  }

  set education(education: string | undefined) {
    this.props.education = education
  }

  set nextAvailability(date: Date | undefined) {
    this.props.nextAvailability = date
  }

  set password(hash: string) {
    this.props.password = hash
  }

  static create(props: ProviderProps, id?: UniqueEntityId) {
    const provider = new Provider(props, id)

    return provider
  }
}
