import { foreignKey, pgTable, text } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { ProviderDb } from './provider'
import { EventDb } from './event'

export const AppointmentDb = pgTable(
  'appointments',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text('name').notNull(),
    email: text('email').notNull(),
    cpf: text('cpf').notNull(),
    phone: text('phone').notNull(),
    description: text('description'),
    providerId: text('provider_id').notNull(),
    eventId: text('event_id').notNull(),
  },
  (Appointment) => ({
    appointments_provider_fkey: foreignKey({
      name: 'appointments_provider_fkey',
      columns: [Appointment.providerId],
      foreignColumns: [ProviderDb.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    appointments_event_fkey: foreignKey({
      name: 'appointments_event_fkey',
      columns: [Appointment.eventId],
      foreignColumns: [EventDb.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
  })
)

export const AppointmentDbRelations = relations(AppointmentDb, ({ one }) => ({
  provider: one(ProviderDb, {
    relationName: 'AppointmentToProvider',
    fields: [AppointmentDb.providerId],
    references: [ProviderDb.id],
  }),
  event: one(EventDb, {
    relationName: 'AppointmentToEvent',
    fields: [AppointmentDb.eventId],
    references: [EventDb.id],
  }),
}))
