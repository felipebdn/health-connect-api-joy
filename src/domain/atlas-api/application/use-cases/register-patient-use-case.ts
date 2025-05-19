import { type Either, left, right } from '@/core/either'
import type { HashGenerator } from '../cryptography/hash-generator'
import type { PatientRepository } from '../repositories/patient-repository'
import { ResourceAlreadyExistsError } from '@/core/errors/resource-already-exists-error'
import { Patient } from '../../enterprise/entities/patient'

interface RegisterPatientUseCaseRequest {
  name: string
  email: string
  cpf: string
  password: string
  phone: string
  birthday: Date
}

type RegisterPatientUseCaseResponse = Either<
  ResourceAlreadyExistsError,
  unknown
>

export class RegisterPatientUseCase {
  constructor(
    private patientRepository: PatientRepository,
    private hashGenerator: HashGenerator
  ) {}

  async execute(
    data: RegisterPatientUseCaseRequest
  ): Promise<RegisterPatientUseCaseResponse> {
    const findSameCPF = await this.patientRepository.findByCPF(data.cpf)
    if (findSameCPF) {
      return left(new ResourceAlreadyExistsError('cpf'))
    }
    const findSameEmail = await this.patientRepository.findByEmail(data.email)

    if (findSameEmail) {
      return left(new ResourceAlreadyExistsError('email'))
    }
    const findSamePhone = await this.patientRepository.findByPhone(data.phone)

    if (findSamePhone) {
      return left(new ResourceAlreadyExistsError('phone'))
    }

    const { password, ...patient } = data

    const hashedPassword = await this.hashGenerator.hash(data.password)

    const newPatient = Patient.create({ ...patient, password: hashedPassword })
    await this.patientRepository.create(newPatient)

    return right({})
  }
}
