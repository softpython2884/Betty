import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role', { enum: ['student', 'professor', 'admin'] }).notNull(),
  status: text('status', { enum: ['active', 'invited'] }).notNull(),
  level: integer('level').default(1),
  xp: integer('xp').default(0),
  orbs: integer('orbs').default(0),
  title: text('title').default('Novice Coder'),
  flowUpUuid: text('flowup_uuid'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const quests = sqliteTable('quests', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  xp: integer('xp').notNull(),
  status: text('status', { enum: ['published', 'draft'] }).notNull(),
  positionTop: text('position_top').notNull(),
  positionLeft: text('position_left').notNull(),
  curriculum: text('curriculum').notNull(),
});

export const questConnections = sqliteTable('quest_connections', {
    fromId: text('from_id').notNull().references(() => quests.id),
    toId: text('to_id').notNull().references(() => quests.id),
});

export const projects = sqliteTable('projects', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    status: text('status').notNull(),
    isQuestProject: integer('is_quest_project', { mode: 'boolean' }).default(false),
    questId: text('quest_id').references(() => quests.id),
    ownerId: text('owner_id').notNull().references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
