import dayjs from 'dayjs'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { UnauthorizedError } from '@/core/errors/unauthorized-error'

import { ConflictActionError } from './errors/conflit-errror-action'
import { type Either, left, right } from '@/core/either'
import type { HashComparer } from '../cryptography/hash-comparer'
import type { HashGenerator } from '../cryptography/hash-generator'
import type { AuthCodesRepository } from '../repositories/auth-codes-repository'
import type { ProviderRepository } from '../repositories/provider-repository'

interface NewPasswordUseCaseRequest {
  code: string
  password: string
}

type NewPasswordUseCaseResponse = Either<
  UnauthorizedError | ResourceNotFoundError | ConflictActionError,
  unknown
>

export class NewPasswordUseCase {
  constructor(
    private providerRepository: ProviderRepository,
    private authCodesRepository: AuthCodesRepository,
    private hasher: HashGenerator,
    private hashComparer: HashComparer
  ) {}

  async execute(
    data: NewPasswordUseCaseRequest
  ): Promise<NewPasswordUseCaseResponse> {
    const codeEntity = await this.authCodesRepository.findById(data.code)

    if (!codeEntity) {
      return left(new UnauthorizedError())
    }

    if (dayjs().diff(codeEntity.createdAt, 'minutes') > 120) {
      return left(new UnauthorizedError())
    }

    const provider = await this.providerRepository.findById(
      codeEntity.providerId.toValue()
    )

    if (!provider) {
      return left(new ResourceNotFoundError('provider'))
    }

    const isSamePassword = await this.hashComparer.compare(
      data.password,
      provider.password
    )

    if (isSamePassword) {
      return left(new ConflictActionError('password'))
    }

    provider.password = await this.hasher.hash(data.password)

    await this.providerRepository.save(provider)
    await this.authCodesRepository.delete(codeEntity.code)

    return right({})
  }
}
