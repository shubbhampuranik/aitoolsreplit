import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  skills: text("skills").array(),
  karmaScore: integer("karma_score").default(0),
  stripeCustomerId: varchar("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories for organizing content
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 7 }).default("#2563eb"),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  toolCount: integer("tool_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tags for content
export const tags = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 50 }).notNull().unique(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Tools
export const pricingTypeEnum = pgEnum("pricing_type", ["free", "freemium", "paid", "free_trial"]);
export const statusEnum = pgEnum("status", ["pending", "approved", "rejected"]);

export const tools = pgTable("tools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  shortDescription: varchar("short_description", { length: 300 }),
  url: text("url").notNull(),
  logoUrl: text("logo_url"),
  gallery: text("gallery").array(),
  pricingType: pricingTypeEnum("pricing_type").default("freemium"),
  pricingDetails: text("pricing_details"),
  categoryId: varchar("category_id").references(() => categories.id),
  submittedBy: varchar("submitted_by").references(() => users.id),
  status: statusEnum("status").default("pending"),
  upvotes: integer("upvotes").default(0),
  views: integer("views").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  ratingCount: integer("rating_count").default(0),
  featured: boolean("featured").default(false),
  socialLinks: jsonb("social_links"),
  faqs: jsonb("faqs"),
  prosAndCons: jsonb("pros_and_cons"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Prompts
export const promptTypeEnum = pgEnum("prompt_type", ["chatgpt", "midjourney", "claude", "gemini", "other"]);

export const prompts = pgTable("prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  type: promptTypeEnum("prompt_type").default("chatgpt"),
  categoryId: varchar("category_id").references(() => categories.id),
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00"),
  isFree: boolean("is_free").default(true),
  outputExamples: text("output_examples").array(),
  submittedBy: varchar("submitted_by").references(() => users.id),
  status: statusEnum("status").default("pending"),
  upvotes: integer("upvotes").default(0),
  views: integer("views").default(0),
  downloads: integer("downloads").default(0),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses
export const skillLevelEnum = pgEnum("skill_level", ["beginner", "intermediate", "advanced"]);

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  instructor: varchar("instructor", { length: 100 }),
  platform: varchar("platform", { length: 100 }),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00"),
  duration: varchar("duration", { length: 50 }),
  skillLevel: skillLevelEnum("skill_level").default("beginner"),
  categoryId: varchar("category_id").references(() => categories.id),
  submittedBy: varchar("submitted_by").references(() => users.id),
  status: statusEnum("status").default("pending"),
  upvotes: integer("upvotes").default(0),
  views: integer("views").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  ratingCount: integer("rating_count").default(0),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Jobs
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  company: varchar("company", { length: 100 }).notNull(),
  description: text("description").notNull(),
  location: varchar("location", { length: 100 }),
  remote: boolean("remote").default(false),
  salary: varchar("salary", { length: 100 }),
  applyUrl: text("apply_url").notNull(),
  companyLogo: text("company_logo"),
  categoryId: varchar("category_id").references(() => categories.id),
  submittedBy: varchar("submitted_by").references(() => users.id),
  status: statusEnum("status").default("pending"),
  views: integer("views").default(0),
  featured: boolean("featured").default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Models
export const modelTypeEnum = pgEnum("model_type", ["language", "image", "audio", "video", "multimodal", "code"]);
export const accessTypeEnum = pgEnum("access_type", ["open_source", "api", "closed", "research"]);

export const models = pgTable("models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  shortDescription: varchar("short_description", { length: 300 }),
  developer: varchar("developer", { length: 100 }).notNull(),
  modelType: modelTypeEnum("model_type").default("language"),
  accessType: accessTypeEnum("access_type").default("api"),
  parameters: varchar("parameters", { length: 50 }), // e.g., "7B", "175B"
  url: text("url"),
  paperUrl: text("paper_url"),
  demoUrl: text("demo_url"),
  licenseType: varchar("license_type", { length: 100 }),
  pricingDetails: text("pricing_details"),
  capabilities: text("capabilities").array(),
  limitations: text("limitations").array(),
  categoryId: varchar("category_id").references(() => categories.id),
  submittedBy: varchar("submitted_by").references(() => users.id),
  status: statusEnum("status").default("pending"),
  upvotes: integer("upvotes").default(0),
  views: integer("views").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  ratingCount: integer("rating_count").default(0),
  featured: boolean("featured").default(false),
  releaseDate: timestamp("release_date"),
  benchmarkScores: jsonb("benchmark_scores"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// News/Blog posts
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImage: text("cover_image"),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  categoryId: varchar("category_id").references(() => categories.id),
  authorId: varchar("author_id").references(() => users.id),
  status: statusEnum("status").default("pending"),
  upvotes: integer("upvotes").default(0),
  views: integer("views").default(0),
  featured: boolean("featured").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Collections
export const collections = pgTable("collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(true),
  ownerId: varchar("owner_id").references(() => users.id),
  upvotes: integer("upvotes").default(0),
  followers: integer("followers").default(0),
  itemCount: integer("item_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comments
export const commentTypeEnum = pgEnum("comment_type", ["tool", "prompt", "course", "job", "post", "model"]);

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  itemType: commentTypeEnum("item_type").notNull(),
  itemId: varchar("item_id").notNull(),
  userId: varchar("user_id").references(() => users.id),
  parentId: varchar("parent_id").references(() => comments.id),
  upvotes: integer("upvotes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookmarks
export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  itemType: commentTypeEnum("item_type").notNull(),
  itemId: varchar("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Votes
export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  itemType: commentTypeEnum("item_type").notNull(),
  itemId: varchar("item_id").notNull(),
  voteType: integer("vote_type"), // 1 for upvote, -1 for downvote
  createdAt: timestamp("created_at").defaultNow(),
});

// Tool tags relationship
export const toolTags = pgTable("tool_tags", {
  toolId: varchar("tool_id").references(() => tools.id),
  tagId: varchar("tag_id").references(() => tags.id),
});

// Prompt tags relationship
export const promptTags = pgTable("prompt_tags", {
  promptId: varchar("prompt_id").references(() => prompts.id),
  tagId: varchar("tag_id").references(() => tags.id),
});

// Collection items
export const collectionItems = pgTable("collection_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  collectionId: varchar("collection_id").references(() => collections.id),
  itemType: commentTypeEnum("item_type").notNull(),
  itemId: varchar("item_id").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

// Prompt purchases table for tracking paid prompt transactions
export const promptPurchases = pgTable("prompt_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  promptId: varchar("prompt_id").references(() => prompts.id).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("usd"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, completed, failed
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tools: many(tools),
  prompts: many(prompts),
  courses: many(courses),
  jobs: many(jobs),
  posts: many(posts),
  collections: many(collections),
  comments: many(comments),
  bookmarks: many(bookmarks),
  votes: many(votes),
  promptPurchases: many(promptPurchases),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  tools: many(tools),
  prompts: many(prompts),
  courses: many(courses),
  jobs: many(jobs),
  posts: many(posts),
}));

export const toolsRelations = relations(tools, ({ one, many }) => ({
  category: one(categories, {
    fields: [tools.categoryId],
    references: [categories.id],
  }),
  submitter: one(users, {
    fields: [tools.submittedBy],
    references: [users.id],
  }),
  tags: many(toolTags),
  comments: many(comments),
  bookmarks: many(bookmarks),
  votes: many(votes),
}));

export const promptsRelations = relations(prompts, ({ one, many }) => ({
  category: one(categories, {
    fields: [prompts.categoryId],
    references: [categories.id],
  }),
  submitter: one(users, {
    fields: [prompts.submittedBy],
    references: [users.id],
  }),
  tags: many(promptTags),
  comments: many(comments),
  bookmarks: many(bookmarks),
  votes: many(votes),
  purchases: many(promptPurchases),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  category: one(categories, {
    fields: [courses.categoryId],
    references: [categories.id],
  }),
  submitter: one(users, {
    fields: [courses.submittedBy],
    references: [users.id],
  }),
  comments: many(comments),
  bookmarks: many(bookmarks),
  votes: many(votes),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  category: one(categories, {
    fields: [jobs.categoryId],
    references: [categories.id],
  }),
  submitter: one(users, {
    fields: [jobs.submittedBy],
    references: [users.id],
  }),
  comments: many(comments),
  bookmarks: many(bookmarks),
}));

export const modelsRelations = relations(models, ({ one, many }) => ({
  category: one(categories, {
    fields: [models.categoryId],
    references: [categories.id],
  }),
  submitter: one(users, {
    fields: [models.submittedBy],
    references: [users.id],
  }),
  comments: many(comments),
  bookmarks: many(bookmarks),
  votes: many(votes),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  bookmarks: many(bookmarks),
  votes: many(votes),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  owner: one(users, {
    fields: [collections.ownerId],
    references: [users.id],
  }),
  items: many(collectionItems),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
}));

export const promptPurchasesRelations = relations(promptPurchases, ({ one }) => ({
  user: one(users, {
    fields: [promptPurchases.userId],
    references: [users.id],
  }),
  prompt: one(prompts, {
    fields: [promptPurchases.promptId],
    references: [prompts.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Tool = typeof tools.$inferSelect;
export type Prompt = typeof prompts.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Model = typeof models.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type PromptPurchase = typeof promptPurchases.$inferSelect;
export type InsertPromptPurchase = typeof promptPurchases.$inferInsert;

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertToolSchema = createInsertSchema(tools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  upvotes: true,
  views: true,
  rating: true,
  ratingCount: true,
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  upvotes: true,
  views: true,
  downloads: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  upvotes: true,
  views: true,
  rating: true,
  ratingCount: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
});

export const insertModelSchema = createInsertSchema(models).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  upvotes: true,
  views: true,
  rating: true,
  ratingCount: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  upvotes: true,
  views: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  upvotes: true,
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  upvotes: true,
  followers: true,
  itemCount: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertTool = z.infer<typeof insertToolSchema>;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type InsertModel = z.infer<typeof insertModelSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
