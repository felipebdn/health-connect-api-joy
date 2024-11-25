import type { Provider } from '@/domain/atlas-api/enterprise/entities/provider'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ProviderPresenter {
  static toHTTP(provider: Provider) {
    return {
      id: provider.id.toString(),
      name: provider.name,
      email: provider.email,
      cpf: provider.cpf,
      phone: provider.phone,
      duration: provider.duration ? provider.duration / 60 : null,
      birthday: provider.birthday,
      price: provider.price,
      specialty: provider.specialty,
      education: provider.education,
      description: provider.description,
    }
  }
}
