import { UniqueEntityId } from '@/core/entities/unique-entity-id'

import { ListAppointmentsEmailCPFUseCase } from './list-appointments-cpf-email-use-case'
import { makeAppointment } from 'tests/factories/make-appointment'
import { InMemoryAppointmentRepository } from 'tests/repositories/in-memory-appointment-repository'

let inMemoryAppointmentRepository: InMemoryAppointmentRepository
let sut: ListAppointmentsEmailCPFUseCase

describe('List Appointments', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository()

    sut = new ListAppointmentsEmailCPFUseCase(inMemoryAppointmentRepository)
  })

  it('should be able to send for password recovery', async () => {
    const appointment = makeAppointment(
      {
        email: 'johndoe@example.com',
        cpf: '12345678909',
      },
      new UniqueEntityId('appointment-01')
    )
    inMemoryAppointmentRepository.items.push(appointment)

    const result = await sut.execute({
      cpf: '12345678909',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.appointments).length(1)
    }
  })
})
