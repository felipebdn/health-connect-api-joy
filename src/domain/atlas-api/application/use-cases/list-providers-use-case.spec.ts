import { makeProvider } from '@test/factories/make-provider'
import { ListProvidersUseCase } from './list-providers-use-case'
import { InMemoryProviderRepository } from '@test/repositories/in-memory-provider-repository'
import { InMemoryEventRepository } from '@test/repositories/in-memory-events-repository'
import { InMemoryProviderEventRepository } from '@test/repositories/in-memory-provider-event-rating-repository'
import { InMemoryRatingRepository } from '@test/repositories/in-memory-rating-repository'

let inMemoryProviderEventRepository: InMemoryProviderEventRepository
let inMemoryProviderRepository: InMemoryProviderRepository
let inMemoryEventRepository: InMemoryEventRepository
let inMemoryRatingRepository: InMemoryRatingRepository
let sut: ListProvidersUseCase

describe('List Providers Use Case', () => {
  beforeEach(() => {
    inMemoryProviderRepository = new InMemoryProviderRepository()
    inMemoryEventRepository = new InMemoryEventRepository()
    inMemoryRatingRepository = new InMemoryRatingRepository()
    inMemoryProviderEventRepository = new InMemoryProviderEventRepository(
      inMemoryProviderRepository,
      inMemoryEventRepository,
      inMemoryRatingRepository
    )
    sut = new ListProvidersUseCase(inMemoryProviderEventRepository)
  })

  it('should list all providers when no filters are applied', async () => {
    const provider1 = makeProvider({
      name: 'Fernando',
      specialty: 'Cardiology',
    })
    const provider2 = makeProvider({
      name: 'Fernanda',
      specialty: 'Pediatrics',
    })

    inMemoryProviderRepository.items.push(provider1, provider2)

    const result = await sut.execute({})

    if (result) {
      expect(result.providers).toHaveLength(2)
      expect(result.providers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ provider: provider1 }),
          expect.objectContaining({ provider: provider2 }),
        ])
      )
    }
  })

  it('should filter providers by name', async () => {
    const provider1 = makeProvider({
      name: 'Fernando',
      specialty: 'Cardiology',
    })
    const provider2 = makeProvider({
      name: 'Fernanda',
      specialty: 'Pediatrics',
    })

    inMemoryProviderRepository.items.push(provider1, provider2)

    const result = await sut.execute({ name: 'Fernan' })

    if (result) {
      expect(result.providers).toHaveLength(2)
      expect(result.providers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ provider: provider1 }),
          expect.objectContaining({ provider: provider2 }),
        ])
      )
    }
  })

  it('should filter providers by specialty', async () => {
    const provider1 = makeProvider({
      name: 'Fernando',
      specialty: 'Cardiology',
    })
    const provider2 = makeProvider({
      name: 'Fernanda',
      specialty: 'Pediatrics',
    })

    inMemoryProviderRepository.items.push(provider1, provider2)

    const result = await sut.execute({ specialty: 'Pediatrics' })

    if (result) {
      expect(result.providers).toHaveLength(1)
      expect(result.providers[0]).toEqual(
        expect.objectContaining({ provider: provider2 })
      )
    }
  })

  it('should limit the number of providers returned', async () => {
    const provider1 = makeProvider({
      name: 'Fernando',
      specialty: 'Cardiology',
    })
    const provider2 = makeProvider({
      name: 'Fernanda',
      specialty: 'Pediatrics',
    })
    const provider3 = makeProvider({ name: 'Felipe', specialty: 'Neurology' })

    inMemoryProviderRepository.items.push(provider1, provider2, provider3)

    const result = await sut.execute({ amount: 2 })

    expect(result.providers).toHaveLength(2)
  })

  it('should paginate the results', async () => {
    const provider1 = makeProvider({
      name: 'Fernando',
      specialty: 'Cardiology',
    })
    const provider2 = makeProvider({
      name: 'Fernanda',
      specialty: 'Pediatrics',
    })
    const provider3 = makeProvider({ name: 'Felipe', specialty: 'Neurology' })

    inMemoryProviderRepository.items.push(provider1, provider2, provider3)

    const result = await sut.execute({ amount: 1, limit: 1 })

    expect(result.providers).toHaveLength(1)
    expect(result.providers[0]).toEqual(
      expect.objectContaining({ provider: provider3 })
    )
  })

  it('should return an empty list if no providers match the filters', async () => {
    const provider1 = makeProvider({
      name: 'Fernando',
      specialty: 'Cardiology',
    })
    const provider2 = makeProvider({
      name: 'Fernanda',
      specialty: 'Pediatrics',
    })

    inMemoryProviderRepository.items.push(provider1, provider2)

    const result = await sut.execute({ name: 'NonExistent' })

    expect(result.providers).toHaveLength(0)
  })
})
