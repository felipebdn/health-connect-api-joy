import { Provider } from '@/domain/atlas-api/enterprise/entities/provider'
import { mockProviders } from '@/lib/mock/providers'
import bcryptjs from 'bcryptjs'
import { getPrismaClient } from './prisma'
import { PrismaProviderMapper } from './mappers/prisma-provider-mapper'
import { RRule } from '@/lib/rrule'
import { EventEntity } from '@/domain/atlas-api/enterprise/entities/event'
import dayjs from 'dayjs'
import { PrismaEventMapper } from './mappers/prisma-event-mapper'

const timeZone = 'America/Sao_Paulo'

async function seedProviders() {
  const prisma = getPrismaClient()

  const providers = await Promise.all(
    mockProviders.map(async (item) => {
      const provider = Provider.create({
        ...item,
        password: await bcryptjs.hash('1234568', 8),
      })

      return provider
    })
  )

  await prisma.provider.createMany({
    data: providers.map(PrismaProviderMapper.toPrisma),
  })

  const events = providers.flatMap(({ id }) => {
    const startTime = dayjs()
      .startOf('week')
      .add(1, 'day')
      .hour(9)
      .minute(0)
      .second(0)

    const endTime = startTime.add(30, 'minutes')

    const rule = new RRule({
      freq: RRule.WEEKLY,
      interval: 1,
      byweekday: [RRule.MO, RRule.WE],
      dtstart: startTime.toDate(),
    })

    return EventEntity.create({
      endTime: endTime.toDate(),
      endTimezone: timeZone,
      providerId: id,
      startTime: startTime.toDate(),
      startTimezone: timeZone,
      title: 'availability',
      recurrenceRule: rule.toString(),
    })
  })

  await prisma.event.createMany({
    data: events.map(PrismaEventMapper.toPrisma),
  })
}

seedProviders()
  .then(() => {
    console.log('Providers seeded with success!')
  })
  .catch((err) => {
    console.error('Error seeding providers:', err)
  })
