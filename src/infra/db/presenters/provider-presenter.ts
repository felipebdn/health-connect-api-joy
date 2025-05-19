import type { Provider } from '@/domain/atlas-api/enterprise/entities/provider'
import { z } from 'zod'

export const ProviderPresenterSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  cpf: z.string(),
  providerCode: z.string(),
  phone: z.string(),
  duration: z.number(),
  birthday: z.date(),
  occupation: z.string(),
  nextAvailability: z.coerce.date().optional(),
  price: z.number(),
  specialty: z.string(),
  education: z.string().optional(),
  description: z.string().optional(),
})

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ProviderPresenter {
  static toHTTP(provider: Provider): z.infer<typeof ProviderPresenterSchema> {
    return {
      id: provider.id.toString(),
      name: provider.name,
      email: provider.email,
      providerCode: provider.providerCode,
      cpf: provider.cpf,
      occupation: provider.occupation,
      phone: provider.phone,
      duration: provider.duration / 60,
      nextAvailability: provider.nextAvailability,
      birthday: provider.birthday,
      price: provider.price,
      specialty: provider.specialty,
      education: provider.education,
      description: provider.description,
    }
  }
}
