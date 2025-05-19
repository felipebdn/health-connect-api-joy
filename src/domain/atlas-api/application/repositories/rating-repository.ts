import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Rating } from '../../enterprise/entities/rating'

export interface RatingRepository {
  create(Rating: Rating): Promise<{ RatingId: UniqueEntityId }>
  findById(RatingId: string): Promise<Rating | null>
  delete(RatingId: string): Promise<void>
  save(data: Rating): Promise<void>
  findManyByProvider(providerId: string): Promise<Rating[]>
}
