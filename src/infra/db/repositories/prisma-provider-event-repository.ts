import type { PrismaClient } from '@prisma/client'
import { PrismaEventMapper } from '../mappers/prisma-event-mapper'
import { PrismaProviderMapper } from '../mappers/prisma-provider-mapper'
import type {
  findByFilterWithEventsProps,
  findByFilterWithEventsResponse,
  findByInstitutionProps,
  findByInstitutionResponse,
  ProviderEventRatingRepository,
} from '@/domain/atlas-api/application/repositories/provider-event-rating-repository'
import { PrismaRatingMapper } from '../mappers/prisma-rating-mapper'
import { PrismaAddressMapper } from '../mappers/prisma-address-mapper'
import { PrismaAppointmentMapper } from '../mappers/prisma-appointment-mapper'

export class PrismaProviderEventRepository
  implements ProviderEventRatingRepository
{
  constructor(private prisma: PrismaClient) {}

  async findByFilterWithEvents(
    data: findByFilterWithEventsProps
  ): Promise<findByFilterWithEventsResponse[]> {
    const providers = await this.prisma.provider.findMany({
      where: {
        ...(data.name && {
          name: { contains: data.name, mode: 'insensitive' },
        }),
        ...(data.specialty && {
          specialty: data.specialty,
        }),
        ...(data.price && {
          price: { gte: data.price },
        }),
      },
      include: {
        events: {
          where: {
            title: 'availability',
          },
        },
        rating: true,
        address: true,
      },
      take: data.amount,
      skip: data.page ? (data.page - 1) * (data.amount ?? 20) : undefined,
      orderBy: { name: 'asc' },
    })

    return providers.map(({ events, rating, address, ...provider }) => {
      return {
        events: events.map(PrismaEventMapper.toDomain),
        provider: PrismaProviderMapper.toDomain(provider),
        ratings: rating.map(PrismaRatingMapper.toDomain),
        address: address ? PrismaAddressMapper.toDomain(address) : undefined,
      }
    })
  }

  async findByInstitution(
    data: findByInstitutionProps
  ): Promise<findByInstitutionResponse[]> {
    const providersByInstitution = await this.prisma.provider
      .findMany({
        where: {
          ...(data.occupation && { occupation: data.occupation }),
          ...(data.specialty && { specialty: data.specialty }),
          institutions: { some: { institutionId: data.institutionId } },
        },
        include: {
          rating: true,
          appointments: {
            include: { event: true },
            where: { institutionId: data.institutionId },
          },
        },
      })
      .then((providers) => {
        return providers.map(({ appointments, rating, ...provider }) => {
          return {
            provider: PrismaProviderMapper.toDomain(provider),
            appointments: appointments.map(({ event, ...appointment }) => ({
              appointment: PrismaAppointmentMapper.toDomain(appointment),
              event: PrismaEventMapper.toDomain(event),
            })),
            ratings: rating.map(PrismaRatingMapper.toDomain),
          }
        })
      })

    return providersByInstitution
  }
}
