import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

export interface PatientProps {
  name: string
  email: string
  cpf: string
  password: string
  phone: string
  birthday: Date
  addressId?: UniqueEntityId
}

export class Patient extends Entity<PatientProps> {
  get addressId() {
    return this.props.addressId
  }

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
  get password() {
    return this.props.password
  }

  get birthday() {
    return this.props.birthday
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

  set password(hash: string) {
    this.props.password = hash
  }

  static create(props: PatientProps, id?: UniqueEntityId) {
    const patient = new Patient(props, id)

    return patient
  }
}
