import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { ProviderRepository } from '../repositories/provider-repository'

interface UpdateProviderUseCaseRequest {
  providerId: string
  name: string
  phone: string
  birthday: Date
  duration: number
  price: number
  specialty: string
  education?: string
  description?: string
}

type UpdateProviderUseCaseResponse = Either<ResourceNotFoundError, unknown>

export class UpdateProviderUseCase {
  constructor(private providerRepository: ProviderRepository) {}

  async execute(
    data: UpdateProviderUseCaseRequest
  ): Promise<UpdateProviderUseCaseResponse> {
    const provider = await this.providerRepository.findById(data.providerId)

    if (!provider) {
      return left(new ResourceNotFoundError('provider'))
    }

    const {
      birthday,
      duration,
      name,
      phone,
      price,
      specialty,
      description,
      education,
    } = data

    provider.birthday = birthday
    provider.duration = duration * 60 // recebe em minutos e transforma para segundos.
    provider.name = name
    provider.phone = phone
    provider.price = price
    provider.specialty = specialty
    provider.description = description ?? undefined
    provider.education = education ?? undefined

    await this.providerRepository.save(provider)

    return right({})
  }
}
