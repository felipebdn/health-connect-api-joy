import type { InstitutionProviderEventRepository } from '../repositories/institution-provider-event-repository'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import type { Provider } from '../../enterprise/entities/provider'
import { RRule } from '@/lib/rrule'

dayjs.extend(isBetween)

interface ListAvailabilitiesByInstitutionUseCaseRequest {
  date: Date
  institutionId: string
}

type ListAvailabilitiesByInstitutionUseCaseResponse = Record<string, Provider[]>

export class ListAvailabilitiesByInstitutionUseCase {
  constructor(
    private institutionProviderEvent: InstitutionProviderEventRepository
  ) {}

  async execute({
    date,
    institutionId,
  }: ListAvailabilitiesByInstitutionUseCaseRequest): Promise<ListAvailabilitiesByInstitutionUseCaseResponse> {
    const providers =
      await this.institutionProviderEvent.listAvailabilitiesByDay({
        institutionId,
      })

    const availabilities: Record<string, Provider[]> = {}

    const startOfDay = dayjs(date).startOf('day').toDate()
    const endOfDay = dayjs(date).endOf('day').toDate()

    for (const data of providers) {
      for (const event of data.events) {
        if (event.recurrenceRule && event.title === 'availability') {
          const datesExceptions = event.recurrenceException?.split(',') ?? []

          const occurrences = RRule.fromString(event.recurrenceRule).between(
            startOfDay,
            endOfDay,
            true, // inclusive,
            (date) => {
              for (const exception of datesExceptions) {
                if (dayjs(exception).isSame(date, 'day')) {
                  return false
                }
              }
              return true
            }
          )

          const eventTime = dayjs(event.startTime)
          const baseDate = dayjs(date)

          const dateByEvent = baseDate
            .set('hour', eventTime.hour())
            .set('minute', eventTime.minute())
            .set('second', eventTime.second())
            .set('millisecond', eventTime.millisecond())

          if (occurrences.length >= 1) {
            const iso = dateByEvent.toISOString()
            availabilities[iso] ??= []
            availabilities[iso].push(data.provider)
          }
        } else if (!event.recurrenceRule && event.title === 'availability') {
          if (dayjs(event.startTime).isBetween(startOfDay, endOfDay, 'hours')) {
            const iso = event.startTime.toISOString()
            availabilities[iso] ??= []
            availabilities[iso].push(data.provider)
          }
        }
      }
    }

    // lista de horários
    // cada item deve conter os medicos com disponibilidade naquele horário

    return availabilities
  }
}
