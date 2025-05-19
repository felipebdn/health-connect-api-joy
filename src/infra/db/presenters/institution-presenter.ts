import type { Institution } from '@/domain/atlas-api/enterprise/entities/institution'
import { z } from 'zod'

export const InstitutionPresenterSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  institutionName: z.string(),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  addressId: z.string().optional(),
  createdAt: z.coerce.date(),
})

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class InstitutionPresenter {
  static toHTTP(
    institution: Institution
  ): z.infer<typeof InstitutionPresenterSchema> {
    return {
      id: institution.id.toString(),
      name: institution.name,
      email: institution.email,
      institutionName: institution.institutionName,
      cnpj: institution.cnpj,
      phone: institution.phone,
      addressId: institution.addressId?.toString(),
      createdAt: institution.createdAt,
    }
  }
}
