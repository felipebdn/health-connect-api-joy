export interface sendMessageConfirmationAppointmentProps {
  action_subject: string
  action: string
  provider_name: string
  patient_name: string
  date: string
  provider_email: string
  patient_email: string
}

export interface sendMessageForgetPasswordProps {
  recovery_email: string
  recovery_code: string
}

export interface EmailService {
  sendMessageConfirmationAppointment(
    data: sendMessageConfirmationAppointmentProps
  ): Promise<boolean>

  sendMessageForgetPassword(
    data: sendMessageForgetPasswordProps
  ): Promise<boolean>
}
