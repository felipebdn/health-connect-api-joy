import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Rating } from '@/domain/atlas-api/enterprise/entities/rating'
import type { Prisma, Rating as PrismaRating } from '@prisma/client'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PrismaRatingMapper {
  static toDomain(raw: PrismaRating): Rating {
    return Rating.create(
      {
        appointmentId: new UniqueEntityId(raw.appointmentId),
        description: raw.description ?? undefined,
        patientId: new UniqueEntityId(raw.patientId),
        providerId: new UniqueEntityId(raw.providerId),
        name: raw.name,
        rating: raw.rating,
        createdAt: raw.createdAt,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(rating: Rating): Prisma.RatingUncheckedCreateInput {
    return {
      id: rating.id.toValue(),
      appointmentId: rating.appointmentId.toValue(),
      patientId: rating.patientId.toValue(),
      name: rating.name,
      providerId: rating.providerId.toValue(),
      rating: rating.rating,
      createdAt: rating.createdAt,
      description: rating.description,
    }
  }
}
