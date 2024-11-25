import { faker } from '@faker-js/faker'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Appointment,
  type AppointmentProps,
} from '@/domain/atlas-api/enterprise/entities/appointment'
import { db } from '@/infra/db/connection'
import { AppointmentDb } from '@/infra/db/schema'
import { DrizzleAppointmentMapper } from '@/infra/db/mappers/drizzle-appointment-mapper'

export function makeAppointment(
  override?: Partial<AppointmentProps>,
  id?: UniqueEntityId
) {
  const appointment = Appointment.create(
    {
      eventId: new UniqueEntityId(),
      cpf: '12345678909',
      description: faker.person.bio(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      phone: faker.phone.number(),
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
    const appointmentCreated = makeAppointment(data, id)
    await db
      .insert(AppointmentDb)
      .values(DrizzleAppointmentMapper.toDrizzle(appointmentCreated))

    return appointmentCreated
  }
}
