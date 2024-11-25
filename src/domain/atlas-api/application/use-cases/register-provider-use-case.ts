import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'

import { Provider } from '../../enterprise/entities/provider'
import { type Either, left, right } from '@/core/either'
import type { HashGenerator } from '../cryptography/hash-generator'
import type { ProviderRepository } from '../repositories/provider-repository'

interface RegisterProviderUseCaseRequest {
  name: string
  email: string
  phone: string
  birthday: Date
  duration: number
  price: number
  cpf: string
  password: string
  specialty: string
  education?: string
  description?: string
}

type RegisterProviderUseCaseResponse = Either<
  ResourceAlreadyExistsError,
  unknown
>

export class RegisterProviderUseCase {
  constructor(
    private providerRepository: ProviderRepository,
    private hashGenerator: HashGenerator
  ) {}

  async execute(
    data: RegisterProviderUseCaseRequest
  ): Promise<RegisterProviderUseCaseResponse> {
    const isEmailProviderAlreadyExists =
      await this.providerRepository.findByEmail(data.email)

    if (isEmailProviderAlreadyExists) {
      return left(new ResourceAlreadyExistsError('email'))
    }

    const isCPFProviderAlreadyExists = await this.providerRepository.findByCPF(
      data.cpf
    )

    if (isCPFProviderAlreadyExists) {
      return left(new ResourceAlreadyExistsError('cpf'))
    }

    const hashedPassword = await this.hashGenerator.hash(data.password)

    const newProvider = Provider.create({
      cpf: data.cpf,
      email: data.email,
      name: data.name,
      duration: data.duration * 60,
      password: hashedPassword,
      specialty: data.specialty,
      description: data.description ?? undefined,
      education: data.education ?? undefined,
      birthday: data.birthday,
      phone: data.phone,
      price: data.price,
    })

    await this.providerRepository.create(newProvider)

    return right({})
  }
}
