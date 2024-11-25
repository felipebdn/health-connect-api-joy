import type { EmailService } from '@/domain/atlas-api/application/services/email'

export class InMemoryEmailService implements EmailService {
  async sendMessageConfirmationAppointment(): Promise<boolean> {
    return true
  }

  async sendMessageForgetPassword(): Promise<boolean> {
    return true
  }
}
