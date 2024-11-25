import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export interface CodeProps {
  providerId: UniqueEntityId
  code: string
  createdAt: Date
}

export class Code extends Entity<CodeProps> {
  get providerId() {
    return this.props.providerId
  }

  get code() {
    return this.props.code
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: Optional<CodeProps, 'createdAt'>, id?: UniqueEntityId) {
    const code = new Code(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return code
  }
}
