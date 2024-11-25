import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

export interface EventProps {
  title: 'availability' | 'appointment'
  providerId: UniqueEntityId
  startTime: Date
  endTime: Date
  startTimezone: string
  endTimezone: string
  recurrenceRule?: string
  recurrenceID?: UniqueEntityId
  recurrenceException?: string
}

export class EventEntity extends Entity<EventProps> {
  get providerId() {
    return this.props.providerId
  }

  get title() {
    return this.props.title
  }

  get startTime() {
    return this.props.startTime
  }

  get endTime() {
    return this.props.endTime
  }

  get startTimezone() {
    return this.props.startTimezone
  }

  get endTimezone() {
    return this.props.endTimezone
  }

  get recurrenceRule(): string | undefined {
    return this.props.recurrenceRule
  }

  get recurrenceID(): UniqueEntityId | undefined {
    return this.props.recurrenceID
  }

  get recurrenceException(): string | undefined {
    return this.props.recurrenceException
  }

  set title(title: 'availability' | 'appointment') {
    this.props.title = title
  }

  set recurrenceException(date: Date | undefined) {
    if (date) {
      const recurrenceException = this.props.recurrenceException
      this.props.recurrenceException = recurrenceException
        ? recurrenceException.concat(`,${date.toISOString()}`)
        : date.toISOString()
    } else {
      this.props.recurrenceException = undefined
    }
  }

  set recurrenceID(recurrenceID: string | undefined) {
    this.props.recurrenceID = recurrenceID
      ? new UniqueEntityId(recurrenceID)
      : undefined
  }

  set recurrenceRule(rule: string | undefined) {
    this.props.recurrenceRule = rule
  }

  set startTime(date: Date) {
    this.props.startTime = date
  }

  set endTime(date: Date) {
    this.props.endTime = date
  }

  set startTimezone(timezone: string) {
    this.props.startTimezone = timezone
  }

  set endTimezone(timezone: string) {
    this.props.endTimezone = timezone
  }

  static create(
    // props: Optional<EventProps, 'createdAt' | 'available'>,
    props: EventProps,
    id?: UniqueEntityId,
  ) {
    const event = new EventEntity(props, id)

    return event
  }
}
