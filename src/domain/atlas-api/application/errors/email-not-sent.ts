import type { UseCaseError } from '@/core/errors/use-case-error'

export class EmailNotSent extends Error implements UseCaseError {
  constructor() {
    super('Email not sent.')
  }
}
