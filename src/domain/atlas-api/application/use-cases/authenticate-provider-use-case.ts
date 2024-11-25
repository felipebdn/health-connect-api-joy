import { left, right, type Either } from '@/core/either'
import { WrongCredentialsError } from '../errors/wrong-credentials-error'
import type { ProviderRepository } from '../repositories/provider-repository'
import type { HashComparer } from '../cryptography/hash-comparer'
import type { Provider } from '../../enterprise/entities/provider'

interface AuthenticateProviderUseCaseRequest {
  email: string
  password: string
}

type AuthenticateProviderUseCaseResponse = Either<
  WrongCredentialsError,
  { provider: Provider }
>

export class AuthenticateProviderUseCase {
  constructor(
    private providerRepository: ProviderRepository,
    private hashComparer: HashComparer
  ) {}

  async execute(
    data: AuthenticateProviderUseCaseRequest
  ): Promise<AuthenticateProviderUseCaseResponse> {
    const provider = await this.providerRepository.findByEmail(data.email)
    console.log('provider', provider)

    if (!provider) {
      return left(new WrongCredentialsError())
    }

    const isSamePassword = await this.hashComparer.compare(
      data.password,
      provider.password
    )

    if (!isSamePassword) {
      return left(new WrongCredentialsError())
    }

    return right({ provider })
  }
}
