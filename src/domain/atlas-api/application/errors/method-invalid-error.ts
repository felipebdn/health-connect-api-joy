import type { UseCaseError } from '@/core/errors/use-case-error'

export class MethodInvalidError extends Error implements UseCaseError {
  constructor() {
    super('Method invalid error.')
  }
}
