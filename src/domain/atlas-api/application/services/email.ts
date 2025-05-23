export interface SendEmailProps {
  from: string
  to: string
  subject: string
  html: string
}

export interface EmailService {
  sendEmail(
    data: SendEmailProps
  ): Promise<{ code: number; message: string | undefined }>
}
