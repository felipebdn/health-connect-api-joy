import type { EventEntity } from '@/domain/atlas-api/enterprise/entities/event'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class EventPresenter {
  static toHTTP(event: EventEntity) {
    return {
      Id: event.id.toString(),
      providerId: event.providerId.toString(),
      Title: event.title,
      Start: event.startTime,
      InstitutionId: event.institutionId?.toString(),
      End: event.endTime,
      StartTimezone: event.startTimezone,
      EndTimezone: event.endTimezone,
      RecurrenceRule: event.recurrenceRule,
      RecurrenceID: event.recurrenceID
        ? event.recurrenceID.toString()
        : undefined,
      RecurrenceException: event.recurrenceException
        ? event.recurrenceException.replace(/[:-]/g, '')
        : undefined,
    }
  }
}
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class EventPresenterWithAppointment {
  static toHTTP(event: EventEntity) {
    return {
      Id: event.id.toString(),
      providerId: event.providerId.toString(),
      Title: event.title === 'availability' ? 'Disponibilidade' : 'Agendamento',
      Start: event.startTime,
      End: event.endTime,
      Institution: event.institutionId?.toString(),
      StartTimezone: event.startTimezone,
      EndTimezone: event.endTimezone,
      RecurrenceRule: event.recurrenceRule,
      RecurrenceID: event.recurrenceID
        ? event.recurrenceID.toString()
        : undefined,
      RecurrenceException: event.recurrenceException
        ? event.recurrenceException.replace(/[:-]/g, '')
        : undefined,
    }
  }
}
