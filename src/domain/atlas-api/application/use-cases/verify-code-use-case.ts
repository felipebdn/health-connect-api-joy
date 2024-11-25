import dayjs from 'dayjs'

import { UnauthorizedError } from '@/core/errors/unauthorized-error'
import { type Either, left, right } from '@/core/either'
import type { AuthCodesRepository } from '../repositories/auth-codes-repository'

interface VerifyCodeUseCaseRequest {
  code: string
}

type VerifyCodeUseCaseResponse = Either<UnauthorizedError, unknown>

export class VerifyCodeUseCase {
  constructor(private authCodesRepository: AuthCodesRepository) {}

  async execute(
    data: VerifyCodeUseCaseRequest
  ): Promise<VerifyCodeUseCaseResponse> {
    const codeEntity = await this.authCodesRepository.findById(data.code)

    if (!codeEntity) {
      return left(new UnauthorizedError())
    }

    if (dayjs().diff(codeEntity.createdAt, 'minutes') > 120) {
      return left(new UnauthorizedError())
    }

    return right({})
  }
}
