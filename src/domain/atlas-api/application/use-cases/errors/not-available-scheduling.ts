import type { UseCaseError } from '@/core/errors/use-case-error'

export class NotAvailableScheduling extends Error implements UseCaseError {
  constructor(message?: string) {
    super(message ?? 'Not available for scheduling.')
  }
}
