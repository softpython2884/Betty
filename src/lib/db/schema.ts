import {
  integer,
  text,
  sqliteTable,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

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

export const curriculumAssignments = sqliteTable('curriculum_assignments', {
    curriculumId: text('curriculum_id').notNull().references(() => curriculums.id),
    userId: text('user_id').notNull().references(() => users.id),
    status: text('status', { enum: ["not-started", "in-progress", "completed"] }).default('not-started').notNull(),
    progress: integer('progress').default(0),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
}, (table) => ({
    pk: primaryKey({ columns: [table.curriculumId, table.userId] }),
}));

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

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  status: text('status').notNull(),
  isQuestProject: integer('is_quest_project', { mode: 'boolean' }).default(false),
  questId: text('quest_id').references(() => quests.id),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const resources = sqliteTable('resources', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const questConnections = sqliteTable('quest_connections', {
    fromId: text('from_id').notNull().references(() => quests.id),
    toId: text('to_id').notNull().references(() => quests.id),
}, (t) => ({
    pk: primaryKey({ columns: [t.fromId, t.toId] }),
}));

export const questResources = sqliteTable('quest_resources', {
    questId: text('quest_id').notNull().references(() => quests.id),
    resourceId: text('resource_id').notNull().references(() => resources.id),
}, (t) => ({
    pk: primaryKey({ columns: [t.questId, t.resourceId] }),
}));


// RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
  createdCurriculums: many(curriculums),
  assignments: many(curriculumAssignments),
  projects: many(projects),
  createdResources: many(resources),
}));

export const curriculumsRelations = relations(curriculums, ({ one, many }) => ({
  creator: one(users, {
    fields: [curriculums.createdBy],
    references: [users.id],
  }),
  quests: many(quests),
  assignments: many(curriculumAssignments),
}));

export const curriculumAssignmentsRelations = relations(curriculumAssignments, ({ one }) => ({
  curriculum: one(curriculums, {
    fields: [curriculumAssignments.curriculumId],
    references: [curriculums.id],
  }),
  user: one(users, {
    fields: [curriculumAssignments.userId],
    references: [users.id],
  }),
}));

export const questsRelations = relations(quests, ({ one, many }) => ({
    curriculum: one(curriculums, {
        fields: [quests.curriculumId],
        references: [curriculums.id],
    }),
    project: one(projects, {
        fields: [quests.id],
        references: [projects.questId]
    }),
    resources: many(questResources),
    fromConnections: many(questConnections, { relationName: 'from' }),
    toConnections: many(questConnections, { relationName: 'to' }),
}));

export const resourcesRelations = relations(resources, ({ one, many }) => ({
  author: one(users, {
    fields: [resources.authorId],
    references: [users.id],
  }),
  quests: many(questResources),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  quest: one(quests, {
    fields: [projects.questId],
    references: [quests.id],
  }),
}));

export const questConnectionsRelations = relations(questConnections, ({ one }) => ({
    fromQuest: one(quests, {
        fields: [questConnections.fromId],
        references: [quests.id],
        relationName: 'from',
    }),
    toQuest: one(quests, {
        fields: [questConnections.toId],
        references: [quests.id],
        relationName: 'to',
    }),
}));

export const questResourcesRelations = relations(questResources, ({ one }) => ({
    quest: one(quests, {
        fields: [questResources.questId],
        references: [quests.id],
    }),
    resource: one(resources, {
        fields: [questResources.resourceId],
        references: [resources.id],
    }),
}));


export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Curriculum = typeof curriculums.$inferSelect;
export type NewCurriculum = typeof curriculums.$inferInsert;
export type CurriculumAssignment = typeof curriculumAssignments.$inferSelect;
export type NewCurriculumAssignment = typeof curriculumAssignments.$inferInsert;
export type Quest = typeof quests.$inferSelect;
export type NewQuest = typeof quests.$inferInsert;
