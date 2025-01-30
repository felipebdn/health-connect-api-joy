import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export interface AuthCodeProps {
  code: string
  createdAt: Date
  entity: 'INSTITUTION' | 'PATIENT' | 'PROVIDER'
  entityId: UniqueEntityId
}

export class AuthCode extends Entity<AuthCodeProps> {
  get code() {
    return this.props.code
  }

  get entity() {
    return this.props.entity
  }

  get entityId() {
    return this.props.entityId
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<AuthCodeProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const code = new AuthCode(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return code
  }
}
