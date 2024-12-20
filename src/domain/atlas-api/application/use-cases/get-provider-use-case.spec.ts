import { InMemoryProviderRepository } from '@test/repositories/in-memory-provider-repository'
import { Provider } from '../../enterprise/entities/provider'
import { GetProviderUseCase } from './get-provider-use-case'
import { makeProvider } from '@test/factories/make-provider'

let inMemoryProviderRepository: InMemoryProviderRepository

let sut: GetProviderUseCase

describe('Get Provider', () => {
  beforeEach(() => {
    inMemoryProviderRepository = new InMemoryProviderRepository()

    sut = new GetProviderUseCase(inMemoryProviderRepository)
  })

  it('should be able to get provider', async () => {
    const provider = makeProvider({
      email: 'johndoe@example.com',
      name: 'john doe',
    })

    inMemoryProviderRepository.items.push(provider)

    const result = await sut.execute({
      providerId: provider.id.toValue(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.provider).toBeInstanceOf(Provider)
      expect(inMemoryProviderRepository.items[0].name).toBe('john doe')
      expect(inMemoryProviderRepository.items[0].email).toBe(
        'johndoe@example.com'
      )
    }
  })
})
