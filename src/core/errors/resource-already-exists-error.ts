import { RESOURCE_ALREADY_EXISTS_MESSAGES } from './error-messages'
import type { UseCaseError } from './use-case-error'

export class ResourceAlreadyExistsError extends Error implements UseCaseError {
  public readonly code: string
  public readonly field?: string

  constructor(field: string, value?: string) {
    const message =
      RESOURCE_ALREADY_EXISTS_MESSAGES[field] ||
      RESOURCE_ALREADY_EXISTS_MESSAGES.default
    super(value ? `${message} (${value})` : message)

    this.name = 'ResourceAlreadyExistsError'
    this.code = 'resource_already_exists'
    this.field = field
  }

  toJSON() {
    return {
      status: 409,
      message: this.message,
      errors: [
        {
          field: this.field,
          code: this.code,
          message: this.message,
        },
      ],
    }
  }
}
