import type {
  EmailService,
  SendEmailProps,
} from '@/domain/atlas-api/application/services/email'

export class InMemoryEmailService implements EmailService {
  async sendEmail(
    data: SendEmailProps
  ): Promise<{ code: number; message: string | undefined }> {
    return { code: 200, message: 'Email send successfully' }
  }
}
