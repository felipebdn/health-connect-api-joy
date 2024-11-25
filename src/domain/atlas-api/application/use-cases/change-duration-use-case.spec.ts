import { InMemoryProviderRepository } from 'tests/repositories/in-memory-provider-repository'
import { ChangeDurationUseCase } from './change-duration-use-case'
import { makeProvider } from 'tests/factories/make-provider'

let inMemoryProviderRepository: InMemoryProviderRepository
let sut: ChangeDurationUseCase

describe('Change Duration Provider', () => {
  beforeEach(() => {
    inMemoryProviderRepository = new InMemoryProviderRepository()

    sut = new ChangeDurationUseCase(inMemoryProviderRepository)
  })

  it('should be able to change provider appointment duration', async () => {
    const provider = makeProvider({
      email: 'johndoe@example.com',
      duration: 60 * 60,
    })
    inMemoryProviderRepository.items.push(provider)

    expect(inMemoryProviderRepository.items[0].duration).toBe(3600)
    const result = await sut.execute({
      duration: 30,
      providerId: provider.id.toValue(),
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryProviderRepository.items[0].duration).toBe(1800)
  })
})
