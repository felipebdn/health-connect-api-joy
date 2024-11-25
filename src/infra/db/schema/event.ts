import { createId } from '@paralleldrive/cuid2'
import {
  pgTable,
  foreignKey,
  pgEnum,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { AppointmentDb } from './appointment'
import { ProviderDb } from './provider'

export const Title = pgEnum('Title', ['availability', 'appointment'])

export const EventDb = pgTable(
  'events',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    title: Title('title').notNull(),
    startTime: timestamp('start_time', {
      withTimezone: true,
      precision: 3,
    }).notNull(),
    endTime: timestamp('end_time', {
      withTimezone: true,
      precision: 3,
    }).notNull(),
    startTimezone: text('start_timezone').notNull(),
    endTimezone: text('end_timezone').notNull(),
    recurrenceRule: text('recurrence_rule'),
    recurrenceException: text('recurrence_exception'),
    recurrenceID: text('recurrence_id'),
    providerId: text('provider_id').notNull(),
  },
  (EventDb) => ({
    events_provider_fkey: foreignKey({
      name: 'events_provider_fkey',
      columns: [EventDb.providerId],
      foreignColumns: [ProviderDb.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    events_event_fkey: foreignKey({
      name: 'events_event_fkey',
      columns: [EventDb.recurrenceID],
      foreignColumns: [EventDb.id],
    })
      .onDelete('set null')
      .onUpdate('cascade'),
  })
)
export const EventRelations = relations(EventDb, ({ one, many }) => ({
  provider: one(ProviderDb, {
    relationName: 'EventToProvider',
    fields: [EventDb.providerId],
    references: [ProviderDb.id],
  }),
  event: one(EventDb, {
    relationName: 'RecurrenceRelation',
    fields: [EventDb.recurrenceID],
    references: [EventDb.id],
  }),
  appointments: many(AppointmentDb, {
    relationName: 'AppointmentToEvent',
  }),
  EventDb: many(EventDb, {
    relationName: 'RecurrenceRelation',
  }),
}))
