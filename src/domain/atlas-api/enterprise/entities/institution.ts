import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export interface InstitutionProps {
  name: string
  email: string
  password: string
  institutionName: string
  cnpj?: string
  phone?: string
  addressId?: UniqueEntityId
  createdAt: Date
}

export class Institution extends Entity<InstitutionProps> {
  get name() {
    return this.props.name
  }

  get institutionName() {
    return this.props.institutionName
  }

  get email() {
    return this.props.email
  }

  get password() {
    return this.props.password
  }

  get addressId(): UniqueEntityId | undefined {
    return this.props.addressId
  }

  get cnpj() {
    return this.props.cnpj
  }

  get phone() {
    return this.props.phone
  }

  get createdAt() {
    return this.props.createdAt
  }

  set name(name: string) {
    this.props.name = name
  }

  set email(email: string) {
    this.props.email = email
  }

  set password(password: string) {
    this.props.password = password
  }

  set phone(phone: string | undefined) {
    this.props.phone = phone
  }

  set addressId(addressId: UniqueEntityId) {
    this.props.addressId = addressId
  }

  static create(
    props: Optional<InstitutionProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const institution = new Institution({ ...props, createdAt: new Date() }, id)

    return institution
  }
}
