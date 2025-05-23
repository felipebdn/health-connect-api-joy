import type {
  EmailService,
  SendEmailProps,
} from '@/domain/atlas-api/application/services/email'
import { env } from '@/env'
import { Resend } from 'resend'

export class ResendService implements EmailService {
  async sendEmail(
    data: SendEmailProps
  ): Promise<{ code: number; message: string | undefined }> {
    const resend = new Resend(env.RESEND_API_KEY)

    const { data: resultSendEmail, error } = await resend.emails.send({
      from: `Acme <${data.from}>`,
      to: [data.to],
      subject: data.subject,
      html: data.html,
    })

    if (resultSendEmail) {
      return {
        code: 200,
        message: 'Email sent successfully',
      }
    }

    return {
      code: 400,
      message: error?.message,
    }
  }
}
