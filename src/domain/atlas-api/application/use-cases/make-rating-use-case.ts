import { left, right, type Either } from '@/core/either'
import type { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { AppointmentRepository } from '../repositories/appointment-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Rating } from '../../enterprise/entities/rating'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { RatingRepository } from '../repositories/rating-repository'
import type { PatientRepository } from '../repositories/patient-repository'

interface MakeRatingUseCaseRequest {
  providerId: string
  appointmentId: string
  patientId: string
  rating: number
  description?: string
}

export type MakeRatingUseCaseResponse = Either<
  ResourceAlreadyExistsError | ResourceNotFoundError,
  unknown
>

export class MakeRatingUseCase {
  constructor(
    private providerRepository: ProviderRepository,
    private appointmentRepository: AppointmentRepository,
    private patientRepository: PatientRepository,
    private ratingRepository: RatingRepository
  ) {}

  async execute({
    appointmentId,
    providerId,
    patientId,
    ...data
  }: MakeRatingUseCaseRequest): Promise<MakeRatingUseCaseResponse> {
    const provider = await this.providerRepository.findById(providerId)

    if (!provider) return left(new ResourceNotFoundError('provider'))

    const appointment = await this.appointmentRepository.findById(appointmentId)

    if (!appointment) return left(new ResourceNotFoundError('appointment'))

    const patient = await this.patientRepository.findById(patientId)

    if (!patient) return left(new ResourceNotFoundError('patient'))

    const rating = Rating.create({
      ...data,
      appointmentId: new UniqueEntityId(appointmentId),
      providerId: new UniqueEntityId(providerId),
      patientId: new UniqueEntityId(patientId),
      name: 'john doe',
    })

    await this.ratingRepository.create(rating)

    return right({})
  }
}
