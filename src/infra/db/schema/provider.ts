import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { EventDb } from './event'
import { AppointmentDb } from './appointment'
import { authCodesDb } from './auth-codes'

export const ProviderDb = pgTable('providers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  cpf: text('cpf').notNull().unique(),
  password: text('password').notNull(),
  phone: text('phone').notNull(),
  duration: integer('duration').notNull(),
  birthday: timestamp('birthday', {
    withTimezone: true,
    precision: 3,
  }).notNull(),
  specialty: text('specialty').notNull(),
  price: integer('price').notNull(),
  education: text('education'),
  description: text('description'),
})

export const ProviderRelations = relations(ProviderDb, ({ many }) => ({
  events: many(EventDb, {
    relationName: 'EventToProvider',
  }),
  appointments: many(AppointmentDb, {
    relationName: 'AppointmentToProvider',
  }),
  authCodes: many(authCodesDb, {
    relationName: 'ProviderToAuthCodes',
  }),
}))
