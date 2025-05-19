import type { PatientRepository } from '@/domain/atlas-api/application/repositories/patient-repository'
import type { Patient } from '@/domain/atlas-api/enterprise/entities/patient'
import type { PrismaClient } from '@prisma/client'
import { PrismaPatientMapper } from '../mappers/prisma-patient-mapper'

export class PrismaPatientRepository implements PatientRepository {
  constructor(private prisma: PrismaClient) {}

  async create(patient: Patient): Promise<void> {
    await this.prisma.patient.create({
      data: PrismaPatientMapper.toPrisma(patient),
    })
  }
  async save(patient: Patient): Promise<void> {
    await this.prisma.patient.update({
      data: PrismaPatientMapper.toPrisma(patient),
      where: {
        id: patient.id.toValue(),
      },
    })
  }
  async delete(patientId: string): Promise<void> {
    await this.prisma.patient.delete({
      where: {
        id: patientId,
      },
    })
  }
  async findById(id: string): Promise<Patient | null> {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    })
    return patient ? PrismaPatientMapper.toDomain(patient) : null
  }
  async findByEmail(email: string): Promise<Patient | null> {
    const patient = await this.prisma.patient.findUnique({
      where: { email },
    })
    return patient ? PrismaPatientMapper.toDomain(patient) : null
  }
  async findByCPF(cpf: string): Promise<Patient | null> {
    const patient = await this.prisma.patient.findUnique({
      where: { cpf },
    })
    return patient ? PrismaPatientMapper.toDomain(patient) : null
  }
  async findByPhone(phone: string): Promise<Patient | null> {
    const patient = await this.prisma.patient.findUnique({
      where: { phone },
    })
    return patient ? PrismaPatientMapper.toDomain(patient) : null
  }
}
