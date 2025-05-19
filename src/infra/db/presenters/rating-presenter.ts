import type { Rating } from '@/domain/atlas-api/enterprise/entities/rating'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class RatingPresenter {
  static toHTTP(rating: Rating) {
    return {
      id: rating.id.toString(),
      providerId: rating.providerId.toString(),
      appointmentId: rating.appointmentId.toString(),
      patientId: rating.patientId.toString(),
      rating: rating.rating,
      name: rating.name,
      description: rating.description,
      createdAt: rating.createdAt,
    }
  }
}
