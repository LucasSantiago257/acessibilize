import { sqliteTable, text, real, integer, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  passwordSalt: text('password_salt').notNull(),
  failedAttempts: integer('failed_attempts').notNull().default(0),
  lockedUntil: text('locked_until'),
  createdAt: text('created_at').notNull(),
});

export const sessions = sqliteTable('sessions', {
  tokenHash: text('token_hash').primaryKey(),
  userId: text('user_id').notNull(),
  createdAt: text('created_at').notNull(),
  expiresAt: text('expires_at').notNull(),
}, table => [index('sessions_expires_idx').on(table.expiresAt)]);

export const communityPlaces = sqliteTable('community_places', {
  id: text('id').primaryKey(),
  authorId: text('author_id').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  area: text('area').notNull(),
  address: text('address').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  createdAt: text('created_at').notNull(),
}, table => [index('places_author_created_idx').on(table.authorId, table.createdAt)]);

export const accessibilityReports = sqliteTable('accessibility_reports', {
  id: text('id').primaryKey(),
  placeId: text('place_id').notNull(),
  authorId: text('author_id').notNull(),
  authorName: text('author_name').notNull(),
  visitedAt: text('visited_at').notNull(),
  createdAt: text('created_at').notNull(),
  features: text('features').notNull(),
  observation: text('observation').notNull(),
  physicalRating: integer('physical_rating'),
  visualRating: integer('visual_rating'),
  hearingRating: integer('hearing_rating'),
}, table => [index('reports_place_created_idx').on(table.placeId, table.createdAt), index('reports_author_created_idx').on(table.authorId, table.createdAt)]);
