import type { EventRepository } from '@/domain/atlas-api/application/repositories/recurrence-repository'
import type { EventEntity } from '@/domain/atlas-api/enterprise/entities/event'

export class InMemoryEventRepository implements EventRepository {
  public items: EventEntity[] = []

  async getAll(): Promise<EventEntity[]> {
    return this.items
  }

  async create(recurrence: EventEntity): Promise<void> {
    this.items.push(recurrence)
  }

  async save(recurrence: EventEntity): Promise<void> {
    const recurrenceIndex = this.items.findIndex(
      (item) => item.id === recurrence.id
    )

    this.items[recurrenceIndex] = recurrence
  }

  async delete(recurrenceId: string): Promise<void> {
    const getIndex = () => {
      return this.items.findIndex((item) => item.id.toValue() === recurrenceId)
    }

    if (!this.items.at(getIndex())?.recurrenceID) {
      this.items.splice(getIndex(), 1)

      this.items = this.items.map((item) => {
        item.recurrenceID =
          item.recurrenceID?.toValue() === recurrenceId
            ? undefined
            : item.recurrenceID?.toValue()
        return item
      })

      return
    }

    this.items.splice(getIndex(), 1)
  }

  async createMany(events: EventEntity[]): Promise<void> {
    this.items.push(...events)
  }

  async findById(eventId: string): Promise<EventEntity | null> {
    const event = this.items.find((item) => item.id.toValue() === eventId)
    if (!event) {
      return null
    }
    return event
  }

  async findManyEventsAvailable(providerId: string): Promise<EventEntity[]> {
    return this.items.filter(
      (item) =>
        item.providerId.toValue() === providerId &&
        item.title === 'availability'
    )
  }
}
