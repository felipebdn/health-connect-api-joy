import { InMemoryProviderRepository } from '@test/repositories/in-memory-provider-repository'
import { makeProvider } from '@test/factories/make-provider'
import { ListProvidersUseCase } from './list-providers-use-case'

let inMemoryProviderRepository: InMemoryProviderRepository
let sut: ListProvidersUseCase

describe('List Providers Use Case', () => {
  beforeEach(() => {
    inMemoryProviderRepository = new InMemoryProviderRepository()
    sut = new ListProvidersUseCase(inMemoryProviderRepository)
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
        expect.arrayContaining([provider1, provider2])
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
        expect.arrayContaining([provider1, provider2])
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
      expect(result.providers[0]).toEqual(provider2)
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
    expect(result.providers[0]).toEqual(provider3)
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
