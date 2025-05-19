import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { RatingRepository } from '@/domain/atlas-api/application/repositories/rating-repository'
import type { Rating } from '@/domain/atlas-api/enterprise/entities/rating'

export class InMemoryRatingRepository implements RatingRepository {
  public items: Rating[] = []

  async create(Rating: Rating): Promise<{ RatingId: UniqueEntityId }> {
    this.items.push(Rating)
    return { RatingId: Rating.id }
  }

  async save(Rating: Rating): Promise<void> {
    const RatingIndex = this.items.findIndex((item) => item.id === Rating.id)

    this.items[RatingIndex] = Rating
  }

  async delete(RatingId: string): Promise<void> {
    const RatingIndex = this.items.findIndex(
      (item) => item.id.toValue() === RatingId
    )
    this.items.splice(RatingIndex, 1)
  }

  async findById(RatingId: string): Promise<Rating | null> {
    const Rating = this.items.find((item) => item.id.toValue() === RatingId)
    if (!Rating) {
      return null
    }
    return Rating
  }

  async findManyByProvider(providerId: string): Promise<Rating[]> {
    const ratings = this.items.filter(
      (item) => item.providerId.toValue() === providerId
    )
    return ratings
  }
}
