import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { UpdateProviderUseCase } from './update-provider-use-case'
import { makeProvider } from 'tests/factories/make-provider'
import { InMemoryProviderRepository } from 'tests/repositories/in-memory-provider-repository'

let inMemoryProviderRepository: InMemoryProviderRepository
let sut: UpdateProviderUseCase

describe('Update Provider', () => {
  beforeEach(() => {
    inMemoryProviderRepository = new InMemoryProviderRepository()

    sut = new UpdateProviderUseCase(inMemoryProviderRepository)
  })

  it('should be able to update a provider', async () => {
    const provider = makeProvider({}, new UniqueEntityId('provider-01'))

    inMemoryProviderRepository.items.push(provider)

    const result = await sut.execute({
      name: 'john doe',
      phone: '99999999999',
      duration: 60,
      price: 4.5,
      birthday: new Date(),
      specialty: 'general clinic',
      providerId: 'provider-01',
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryProviderRepository.items.length).toBe(1)
    expect(inMemoryProviderRepository.items[0].phone).toBe('99999999999')
  })
})
