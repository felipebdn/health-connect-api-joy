import type { Patient } from '@/domain/atlas-api/enterprise/entities/patient'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PatientPresenter {
  static toHTTP(patient: Patient) {
    return {
      id: patient.id.toString(),
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      birthday: patient.birthday,
      addressId: patient.addressId?.toString(),
    }
  }
}
