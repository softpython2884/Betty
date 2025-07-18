import {
  integer,
  text,
  sqliteTable,
  primaryKey,
} from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['student', 'professor', 'admin'] }).notNull(),
  status: text('status', { enum: ['active', 'invited'] }).notNull(),
  level: integer('level').default(1),
  xp: integer('xp').default(0),
  orbs: integer('orbs').default(0),
  title: text('title').default('Novice Coder'),
  flowUpUuid: text('flowup_uuid'),
  mustChangePassword: integer('must_change_password', {
    mode: 'boolean',
  }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const curriculums = sqliteTable('curriculums', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  subtitle: text('subtitle').notNull(),
  goal: text('goal').notNull(),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type Curriculum = typeof curriculums.$inferSelect;
export type NewCurriculum = typeof curriculums.$inferInsert;

export const curriculumAssignments = sqliteTable('curriculum_assignments', {
    curriculumId: text('curriculum_id').notNull().references(() => curriculums.id),
    userId: text('user_id').notNull().references(() => users.id),
    status: text('status', { enum: ["not-started", "in-progress", "completed"] }).default('not-started').notNull(),
    progress: integer('progress').default(0),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
}, (table) => {
    return {
      pk: primaryKey({ columns: [table.curriculumId, table.userId] }),
    };
});

export type CurriculumAssignment = typeof curriculumAssignments.$inferSelect;
export type NewCurriculumAssignment = typeof curriculumAssignments.$inferInsert;

export const quests = sqliteTable('quests', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  xp: integer('xp').notNull(),
  orbs: integer('orbs').default(0),
  status: text('status', { enum: ['published', 'draft'] }).notNull(),
  positionTop: text('position_top').notNull(),
  positionLeft: text('position_left').notNull(),
  curriculumId: text('curriculum_id')
    .notNull()
    .references(() => curriculums.id),
});

export type Quest = typeof quests.$inferSelect;
export type NewQuest = typeof quests.$inferInsert;

export const questConnections = sqliteTable('quest_connections', {
  fromId: text('from_id')
    .notNull()
    .references(() => quests.id),
  toId: text('to_id')
    .notNull()
    .references(() => quests.id),
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  status: text('status').notNull(),
  isQuestProject: integer('is_quest_project', { mode: 'boolean' }).default(
    false
  ),
  questId: text('quest_id').references(() => quests.id),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const resources = sqliteTable('resources', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(), // Markdown content
  authorId: text('author_id')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const questResources = sqliteTable(
  'quest_resources',
  {
    questId: text('quest_id')
      .notNull()
      .references(() => quests.id),
    resourceId: text('resource_id')
      .notNull()
      .references(() => resources.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.questId, table.resourceId] }),
    };
  }
);
