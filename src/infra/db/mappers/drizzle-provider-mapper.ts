import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { ProviderCreate, ProviderType } from '../types'
import { Provider } from '@/domain/atlas-api/enterprise/entities/provider'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class DrizzleProviderMapper {
  static toDomain(raw: ProviderType): Provider {
    return Provider.create(
      {
        birthday: new Date(raw.birthday),
        cpf: raw.cpf,
        email: raw.email,
        name: raw.name,
        password: raw.password,
        phone: raw.phone,
        price: raw.price,
        specialty: raw.specialty,
        description: raw.description ?? undefined,
        education: raw.education ?? undefined,
        duration: raw.duration,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toDrizzle(provider: Provider): ProviderCreate {
    return {
      id: provider.id.toValue(),
      birthday: provider.birthday,
      cpf: provider.cpf,
      email: provider.email,
      name: provider.name,
      password: provider.password,
      phone: provider.phone,
      price: provider.price,
      duration: provider.duration,
      specialty: provider.specialty,
      description: provider.description,
      education: provider.education,
    }
  }
}
