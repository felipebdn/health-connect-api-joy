import type { Affiliation } from '@/domain/atlas-api/enterprise/entities/affiliation'
import { z } from 'zod'

export const AffiliationPresenterSchema = z.object({
  providerId: z.string(),
  institutionId: z.string(),
  enrolledAt: z.coerce.date(),
  status: z.enum(['ACTIVE', 'PAUSED']),
})

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class AffiliationPresenter {
  static toHTTP(
    affiliation: Affiliation
  ): z.infer<typeof AffiliationPresenterSchema> {
    return {
      providerId: affiliation.providerId.toString(),
      institutionId: affiliation.institutionId.toString(),
      enrolledAt: affiliation.enrolledAt,
      status: affiliation.status,
    }
  }
}
