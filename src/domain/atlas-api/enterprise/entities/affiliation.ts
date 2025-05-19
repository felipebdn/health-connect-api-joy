import { Entity } from '@/core/entities/entity'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

export interface AffiliationProps {
  providerId: UniqueEntityId
  institutionId: UniqueEntityId
  enrolledAt: Date
  status: 'ACTIVE' | 'PAUSED'
}

export class Affiliation extends Entity<AffiliationProps> {
  get providerId() {
    return this.props.providerId
  }

  get institutionId() {
    return this.props.institutionId
  }

  get enrolledAt() {
    return this.props.enrolledAt
  }

  get status() {
    return this.props.status
  }

  set status(status: 'ACTIVE' | 'PAUSED') {
    this.props.status = status
  }

  static create(props: AffiliationProps, id?: UniqueEntityId) {
    const code = new Affiliation(
      {
        ...props,
      },
      id
    )

    return code
  }
}
