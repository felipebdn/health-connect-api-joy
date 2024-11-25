import { relations, sql } from 'drizzle-orm'
import { foreignKey, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { ProviderDb } from './provider'

export const authCodesDb = pgTable(
  'auth-codes',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    code: text('code').notNull().unique(),
    providerId: text('provider_id').notNull(),
    createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  },
  (authCodesDb) => ({
    'auth-codes_provider_fkey': foreignKey({
      name: 'auth-codes_provider_fkey',
      columns: [authCodesDb.providerId],
      foreignColumns: [ProviderDb.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
  })
)
export const authCodesDbRelations = relations(authCodesDb, ({ one }) => ({
  provider: one(ProviderDb, {
    relationName: 'ProviderToauthCodes',
    fields: [authCodesDb.providerId],
    references: [ProviderDb.id],
  }),
}))
