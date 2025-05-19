import { InMemoryProviderRepository } from '@test/repositories/in-memory-provider-repository'
import { Provider } from '../../enterprise/entities/provider'
import { GetProviderUseCase } from './get-provider-use-case'
import { makeProvider } from '@test/factories/make-provider'
import { InMemoryAddressRepository } from '@test/repositories/in-memory-address-repository'
import { InMemoryRatingRepository } from '@test/repositories/in-memory-rating-repository'

let inMemoryProviderRepository: InMemoryProviderRepository
let inMemoryAddressRepository: InMemoryAddressRepository
let inMemoryRatingRepository: InMemoryRatingRepository

let sut: GetProviderUseCase

describe('Get Provider', () => {
  beforeEach(() => {
    inMemoryProviderRepository = new InMemoryProviderRepository()
    inMemoryAddressRepository = new InMemoryAddressRepository()
    inMemoryRatingRepository = new InMemoryRatingRepository()

    sut = new GetProviderUseCase(
      inMemoryProviderRepository,
      inMemoryAddressRepository,
      inMemoryRatingRepository
    )
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
