import { env } from '@/env'
import { sendEmail } from '@/utils/axios'
import type {
  EmailService,
  sendMessageConfirmationAppointmentProps,
  sendMessageForgetPasswordProps,
} from '@/domain/atlas-api/application/services/email'

export class EmailJsService implements EmailService {
  async sendMessageConfirmationAppointment(
    data: sendMessageConfirmationAppointmentProps
  ): Promise<boolean> {
    const response = await sendEmail.post(
      '/send',
      {
        service_id: env.EMAILJS_SERVICE_ID,
        template_id: env.EMAILJS_TEMPLATE_ID_PATIENT,
        user_id: env.PUBLIC_KEY_EMAILJS,
        template_params: {
          action_subject: data.action_subject,
          action: data.action,
          provider_name: data.provider_name,
          patient_name: data.patient_name,
          date: data.date,
          provider_email: data.provider_email,
          patient_email: data.patient_email,
        },
        accessToken: env.PRIVATE_KEY_EMAILJS,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    if (response.status !== 200) {
      return false
    }

    return true
  }

  async sendMessageForgetPassword(
    data: sendMessageForgetPasswordProps
  ): Promise<boolean> {
    const response = await sendEmail.post(
      '/send',
      {
        service_id: env.EMAILJS_SERVICE_ID,
        template_id: env.EMAILJS_TEMPLATE_ID_PROVIDER,
        user_id: env.PUBLIC_KEY_EMAILJS,
        template_params: {
          recovery_email: data.recovery_email,
          recovery_code: data.recovery_code,
        },
        accessToken: env.PRIVATE_KEY_EMAILJS,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.status !== 200) {
      return false
    }

    return true
  }
}
