import type { UseCaseError } from './use-case-error'

export class RequestError extends Error implements UseCaseError {
  constructor() {
    super('Request error.')
  }
}
