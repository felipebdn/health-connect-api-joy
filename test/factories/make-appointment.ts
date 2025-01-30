import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  type AppointmentProps,
  Appointment,
} from '@/domain/atlas-api/enterprise/entities/appointment'
import { PrismaAppointmentMapper } from '@/infra/db/mappers/prisma-appointment-mapper'
import { getPrismaClient } from '@/infra/db/prisma'
import { faker } from '@faker-js/faker'

export function makeAppointment(
  override?: Partial<AppointmentProps>,
  id?: UniqueEntityId
) {
  const appointment = Appointment.create(
    {
      eventId: new UniqueEntityId(),
      institutionId: new UniqueEntityId(),
      patientId: new UniqueEntityId(),
      createdAt: new Date(),
      description: faker.person.bio(),
      providerId: new UniqueEntityId(),
      ...override,
    },
    id
  )

  return appointment
}

export class AppointmentFactory {
  async makePrismaAppointment(
    data: Partial<AppointmentProps>,
    id?: UniqueEntityId
  ) {
    const prisma = getPrismaClient()
    const appointmentCreated = makeAppointment(data, id)
    await prisma.appointment.create({
      data: PrismaAppointmentMapper.toPrisma(appointmentCreated),
    })
    return appointmentCreated
  }
}
