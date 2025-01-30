import type { Patient } from '../../enterprise/entities/patient'

export interface PatientRepository {
  create(patient: Patient): Promise<void>
  save(patient: Patient): Promise<void>
  delete(patientId: string): Promise<void>
  findById(id: string): Promise<Patient | null>
  findByEmail(email: string): Promise<Patient | null>
}
