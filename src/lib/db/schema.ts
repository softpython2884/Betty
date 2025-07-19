

import {
  integer,
  text,
  sqliteTable,
  primaryKey,
  uniqueIndex,
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
  flowUpFpat: text('flowup_fpat'),
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

export const questCompletions = sqliteTable('quest_completions', {
    userId: text('user_id').notNull().references(() => users.id),
    questId: text('quest_id').notNull().references(() => quests.id),
    completedAt: integer('completed_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.questId] }),
}));

export const quizzes = sqliteTable('quizzes', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    questId: text('quest_id').references(() => quests.id).unique(),
    passingScore: integer('passing_score').default(80).notNull(),
});

export const quizQuestions = sqliteTable('quiz_questions', {
    id: text('id').primaryKey(),
    quizId: text('quiz_id').notNull().references(() => quizzes.id),
    text: text('text').notNull(),
    type: text('type', { enum: ['mcq', 'true-false', 'free-text', 'code'] }).notNull(),
});

export const quizOptions = sqliteTable('quiz_options', {
    id: text('id').primaryKey(),
    questionId: text('question_id').notNull().references(() => quizQuestions.id),
    text: text('text').notNull(),
    isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false),
});

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(), // This will be the FlowUp project UUID
  title: text('title').notNull(),
  status: text('status', { enum: ["Active", "In Progress", "Submitted", "Completed"] }).notNull(),
  isQuestProject: integer('is_quest_project', { mode: 'boolean' }).default(false),
  questId: text('quest_id').references(() => quests.id), // The specific quest it's *currently* for
  curriculumId: text('curriculum_id').references(() => curriculums.id), // The curriculum this project is for
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const submissions = sqliteTable('submissions', {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull().references(() => projects.id),
    userId: text('user_id').notNull().references(() => users.id),
    submittedAt: integer('submitted_at', { mode: 'timestamp' }).notNull(),
    status: text('status', { enum: ['pending', 'graded'] }).notNull().default('pending'),
    grade: integer('grade'),
    feedback: text('feedback'),
    gradedBy: text('graded_by').references(() => users.id),
    gradedAt: integer('graded_at', { mode: 'timestamp' }),
});

export const tasks = sqliteTable('tasks', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', { enum: ['backlog', 'sprint', 'review', 'completed'] }).default('backlog').notNull(),
    urgency: text('urgency', { enum: ['normal', 'important', 'urgent'] }).default('normal').notNull(),
    order: integer('order').notNull().default(0),
    deadline: integer('deadline', { mode: 'timestamp' }),
    projectId: text('project_id').notNull().references(() => projects.id),
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

export const documents = sqliteTable('documents', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content'),
    projectId: text('project_id').notNull().references(() => projects.id),
    authorId: text('author_id').notNull().references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }).notNull(),
  type: text('type', { enum: ['personal', 'team', 'global'] }).notNull(),
  userId: text('user_id').references(() => users.id), // Null for team/global events
  projectId: text('project_id').references(() => projects.id), // Null for personal/global events
  authorId: text('author_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
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

export const cosmetics = sqliteTable('cosmetics', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    type: text('type', { enum: ['title_style', 'profile_badge', 'profile_banner'] }).notNull(),
    price: integer('price').notNull(),
    data: text('data', { mode: 'json' }).notNull(), // e.g., { "colors": ["#ff0000", "#00ff00"] }
});

export const userCosmetics = sqliteTable('user_cosmetics', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    cosmeticId: text('cosmetic_id').notNull().references(() => cosmetics.id),
    equipped: integer('equipped', { mode: 'boolean' }).default(false).notNull(),
});

export const badges = sqliteTable('badges', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    icon: text('icon').notNull(),
    type: text('type', { enum: ['milestone', 'skill', 'rank', 'achievement']}).notNull(),
});

export const userBadges = sqliteTable('user_badges', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    badgeId: text('badge_id').notNull().references(() => badges.id),
    pinned: integer('pinned', { mode: 'boolean' }).default(false).notNull(),
    achievedAt: integer('achieved_at', { mode: 'timestamp' }).notNull(),
});


// RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
  createdCurriculums: many(curriculums),
  assignments: many(curriculumAssignments),
  projects: many(projects),
  createdResources: many(resources),
  questCompletions: many(questCompletions),
  documents: many(documents),
  authoredEvents: many(events, { relationName: 'authoredEvents' }),
  personalEvents: many(events, { relationName: 'personalEvents' }),
  cosmetics: many(userCosmetics),
  badges: many(userBadges),
  submissions: many(submissions),
  gradings: many(submissions, { relationName: 'GradedSubmissions' }),
}));

export const curriculumsRelations = relations(curriculums, ({ one, many }) => ({
  creator: one(users, {
    fields: [curriculums.createdBy],
    references: [users.id],
  }),
  quests: many(quests),
  assignments: many(curriculumAssignments),
  projects: many(projects),
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
    quiz: one(quizzes, {
        fields: [quests.id],
        references: [quizzes.questId],
    }),
    project: one(projects, {
        fields: [quests.id],
        references: [projects.questId]
    }),
    resources: many(questResources),
    fromConnections: many(questConnections, { relationName: 'fromConnections' }),
    toConnections: many(questConnections, { relationName: 'toConnections' }),
    completions: many(questCompletions),
}));

export const questCompletionsRelations = relations(questCompletions, ({ one }) => ({
    user: one(users, {
        fields: [questCompletions.userId],
        references: [users.id],
    }),
    quest: one(quests, {
        fields: [questCompletions.questId],
        references: [quests.id],
    }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
    quest: one(quests, {
        fields: [quizzes.questId],
        references: [quests.id],
    }),
    questions: many(quizQuestions),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one, many }) => ({
    quiz: one(quizzes, {
        fields: [quizQuestions.quizId],
        references: [quizzes.id],
    }),
    options: many(quizOptions),
}));

export const quizOptionsRelations = relations(quizOptions, ({ one }) => ({
    question: one(quizQuestions, {
        fields: [quizOptions.questionId],
        references: [quizQuestions.id],
    }),
}));

export const resourcesRelations = relations(resources, ({ one, many }) => ({
  author: one(users, {
    fields: [resources.authorId],
    references: [users.id],
  }),
  quests: many(questResources),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  quest: one(quests, {
    fields: [projects.questId],
    references: [quests.id],
  }),
  curriculum: one(curriculums, {
    fields: [projects.curriculumId],
    references: [curriculums.id],
  }),
  tasks: many(tasks),
  documents: many(documents),
  events: many(events),
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
    project: one(projects, {
        fields: [submissions.projectId],
        references: [projects.id],
    }),
    user: one(users, {
        fields: [submissions.userId],
        references: [users.id],
    }),
    grader: one(users, {
        fields: [submissions.gradedBy],
        references: [users.id],
        relationName: 'GradedSubmissions'
    }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
    project: one(projects, {
        fields: [tasks.projectId],
        references: [projects.id],
    }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
    project: one(projects, {
        fields: [documents.projectId],
        references: [projects.id],
    }),
    author: one(users, {
        fields: [documents.authorId],
        references: [users.id],
    }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
    author: one(users, {
        fields: [events.authorId],
        references: [users.id],
        relationName: 'authoredEvents'
    }),
    user: one(users, { // For personal events
        fields: [events.userId],
        references: [users.id],
        relationName: 'personalEvents'
    }),
    project: one(projects, { // For team events
        fields: [events.projectId],
        references: [projects.id]
    }),
}));

export const questConnectionsRelations = relations(questConnections, ({ one }) => ({
    fromQuest: one(quests, {
        fields: [questConnections.fromId],
        references: [quests.id],
        relationName: 'fromConnections',
    }),
    toQuest: one(quests, {
        fields: [questConnections.toId],
        references: [quests.id],
        relationName: 'toConnections',
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

export const cosmeticsRelations = relations(cosmetics, ({ many }) => ({
    users: many(userCosmetics),
}));

export const userCosmeticsRelations = relations(userCosmetics, ({ one }) => ({
    user: one(users, {
        fields: [userCosmetics.userId],
        references: [users.id],
    }),
    cosmetic: one(cosmetics, {
        fields: [userCosmetics.cosmeticId],
        references: [cosmetics.id],
    }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
    users: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
    user: one(users, {
        fields: [userBadges.userId],
        references: [users.id],
    }),
    badge: one(badges, {
        fields: [userBadges.badgeId],
        references: [badges.id],
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
export type QuestCompletion = typeof questCompletions.$inferSelect;
export type NewQuestCompletion = typeof questCompletions.$inferInsert;
export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type NewQuizQuestion = typeof quizQuestions.$inferInsert;
export type QuizOption = typeof quizOptions.$inferSelect;
export type NewQuizOption = typeof quizOptions.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Cosmetic = typeof cosmetics.$inferSelect;
export type NewCosmetic = typeof cosmetics.$inferInsert;
export type UserCosmetic = typeof userCosmetics.$inferSelect;
export type NewUserCosmetic = typeof userCosmetics.$inferInsert;
export type Badge = typeof badges.$inferSelect;
export type NewBadge = typeof badges.$inferInsert;
export type UserBadge = typeof userBadges.$inferSelect;
export type NewUserBadge = typeof userBadges.$inferInsert;
