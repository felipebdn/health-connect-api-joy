import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

export interface ProviderProps {
  name: string
  email: string
  cpf: string
  password: string
  phone: string
  duration: number
  birthday: Date
  price: number
  specialty: string
  education?: string
  description?: string
}

export class Provider extends Entity<ProviderProps> {
  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get cpf() {
    return this.props.cpf
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

  get education(): string | undefined {
    return this.props.education
  }

  get description(): string | undefined {
    return this.props.description
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

  set specialty(specialty: string) {
    this.props.specialty = specialty
  }

  set description(description: string | undefined) {
    this.props.description = description
  }

  set education(education: string | undefined) {
    this.props.education = education
  }

  set password(hash: string) {
    this.props.password = hash
  }

  static create(props: ProviderProps, id?: UniqueEntityId) {
    const provider = new Provider(props, id)

    return provider
  }
}
