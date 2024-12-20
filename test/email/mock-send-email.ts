import type {
  EmailService,
  sendMessageConfirmationAppointmentProps,
  sendMessageForgetPasswordProps,
} from '@/domain/atlas-api/application/services/email'

export class MockSendEmail implements EmailService {
  async sendMessageConfirmationAppointment(
    _: sendMessageConfirmationAppointmentProps
  ): Promise<boolean> {
    return true
  }

  async sendMessageForgetPassword(
    _: sendMessageForgetPasswordProps
  ): Promise<boolean> {
    return true
  }
}
