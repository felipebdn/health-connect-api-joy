import type { PatientRepository } from '@/domain/atlas-api/application/repositories/patient-repository'
import type { Patient } from '@/domain/atlas-api/enterprise/entities/patient'

export class InMemoryPatientRepository implements PatientRepository {
  public items: Patient[] = []

  async create(patient: Patient): Promise<void> {
    this.items.push(patient)
  }
  async save(patient: Patient): Promise<void> {
    const patientIndex = this.items.findIndex((item) => item.id === patient.id)

    this.items[patientIndex] = patient
  }
  async delete(patientId: string): Promise<void> {
    const patientIndex = this.items.findIndex(
      (item) => item.id.toValue() === patientId
    )
    this.items.splice(patientIndex, 1)
  }
  async findById(patientId: string): Promise<Patient | null> {
    const patient = this.items.find((item) => item.id.toValue() === patientId)
    if (!patient) {
      return null
    }
    return patient
  }
  async findByEmail(email: string): Promise<Patient | null> {
    const patient = this.items.find((item) => item.email === email)
    if (!patient) {
      return null
    }
    return patient
  }
}
