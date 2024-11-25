import type { AppointmentDb, EventDb, ProviderDb, authCodesDb } from './schema'

export type AppointmentType = typeof AppointmentDb.$inferSelect
export type CodeType = typeof authCodesDb.$inferSelect
export type ProviderType = typeof ProviderDb.$inferSelect
export type EventType = typeof EventDb.$inferSelect

export type AppointmentCreate = typeof AppointmentDb.$inferInsert
export type CodeCreate = typeof authCodesDb.$inferInsert
export type ProviderCreate = typeof ProviderDb.$inferInsert
export type EventCreate = typeof EventDb.$inferInsert
