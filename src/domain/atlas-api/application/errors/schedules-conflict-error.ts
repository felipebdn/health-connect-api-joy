import type { UseCaseError } from '@/core/errors/use-case-error'

export class SchedulesConflict extends Error implements UseCaseError {
  constructor() {
    super('Schedules conflict.')
  }
}
