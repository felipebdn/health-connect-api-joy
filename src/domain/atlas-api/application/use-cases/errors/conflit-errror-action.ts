import type { UseCaseError } from '@/core/errors/use-case-error'

export class ConflictActionError extends Error implements UseCaseError {
  constructor(resource: string) {
    super(`Conflict, is same "${resource}".`)
  }
}
