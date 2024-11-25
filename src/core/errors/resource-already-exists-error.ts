import type { UseCaseError } from './use-case-error'

export class ResourceAlreadyExistsError extends Error implements UseCaseError {
  constructor(value?: string) {
    super(`Resource already exists${value && ` [${value}]`}.`)
  }
}
