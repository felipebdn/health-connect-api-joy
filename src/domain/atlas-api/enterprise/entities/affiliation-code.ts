import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Optional } from '@/core/types/optional'

export interface AffiliationCodeProps {
  code: string
  providerId: UniqueEntityId
  institutionId: UniqueEntityId
  createdAt: Date
}

export class AffiliationCode extends Entity<AffiliationCodeProps> {
  get code() {
    return this.props.code
  }

  get providerId() {
    return this.props.providerId
  }

  get institutionId() {
    return this.props.institutionId
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<AffiliationCodeProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const code = new AffiliationCode(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return code
  }
}
