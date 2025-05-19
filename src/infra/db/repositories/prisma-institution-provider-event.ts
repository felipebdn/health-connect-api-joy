import type {
  InstitutionProviderEventRepository,
  listAvailabilitiesByDayResponses,
} from '@/domain/atlas-api/application/repositories/institution-provider-event-repository'
import type { PrismaClient } from '@prisma/client'
import { PrismaEventMapper } from '../mappers/prisma-event-mapper'
import { PrismaProviderMapper } from '../mappers/prisma-provider-mapper'

export class PrismaInstitutionProviderEventRepository
  implements InstitutionProviderEventRepository
{
  constructor(private prisma: PrismaClient) {}

  async listAvailabilitiesByDay(data: {
    institutionId: string
  }): Promise<listAvailabilitiesByDayResponses[]> {
    const result = await this.prisma.provider.findMany({
      include: { institutions: true, events: true },
      where: {
        institutions: { some: { institutionId: data.institutionId } },
        events: { some: { title: 'availability' } },
      },
    })

    return result.map((item) => ({
      events: item.events.map(PrismaEventMapper.toDomain),
      provider: PrismaProviderMapper.toDomain(item),
    }))
  }
}
