import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { RatingRepository } from '@/domain/atlas-api/application/repositories/rating-repository'
import type { Rating } from '@/domain/atlas-api/enterprise/entities/rating'
import type { PrismaClient } from '@prisma/client'
import { PrismaRatingMapper } from '../mappers/prisma-rating-mapper'

export class PrismaRatingRepository implements RatingRepository {
  constructor(private prisma: PrismaClient) {}

  async create(rating: Rating): Promise<{ RatingId: UniqueEntityId }> {
    const { id } = await this.prisma.rating.create({
      data: PrismaRatingMapper.toPrisma(rating),
    })
    return { RatingId: new UniqueEntityId(id) }
  }
  async findById(ratingId: string): Promise<Rating | null> {
    const rating = await this.prisma.rating.findUnique({
      where: { id: ratingId },
    })
    if (!rating) return null
    return PrismaRatingMapper.toDomain(rating)
  }
  async delete(ratingId: string): Promise<void> {
    await this.prisma.rating.delete({ where: { id: ratingId } })
  }
  async save(rating: Rating): Promise<void> {
    await this.prisma.rating.update({
      data: PrismaRatingMapper.toPrisma(rating),
      where: { id: rating.id.toValue() },
    })
  }
  async findManyByProvider(providerId: string): Promise<Rating[]> {
    const ratings = await this.prisma.rating.findMany({
      where: { providerId },
    })
    return ratings.map(PrismaRatingMapper.toDomain)
  }
}
