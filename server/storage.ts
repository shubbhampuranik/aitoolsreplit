import {
  users,
  categories,
  tools,
  prompts,
  courses,
  jobs,
  posts,
  models,
  comments,
  collections,
  reviews,
  reviewVotes,
  tags,
  bookmarks,
  votes,
  toolTags,
  promptTags,
  collectionItems,
  type User,
  type UpsertUser,
  type Category,
  type Tool,
  type Prompt,
  type Course,
  type Job,
  type Model,
  type Post,
  type Comment,
  type Collection,
  type Review,
  type Tag,
  type InsertTool,
  type InsertPrompt,
  type InsertCourse,
  type InsertJob,
  type InsertModel,
  type InsertPost,
  type InsertComment,
  type InsertReview,
  type InsertCollection,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, ilike, and, or, sql, count, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT - mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  
  // Tools
  getTools(params?: {
    categoryId?: string;
    featured?: boolean;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<Tool[]>;
  getTool(id: string): Promise<Tool | undefined>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: string, updates: Partial<Tool>): Promise<Tool>;
  
  // Prompts
  getPrompts(params?: {
    categoryId?: string;
    featured?: boolean;
    isFree?: boolean;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<Prompt[]>;
  getPrompt(id: string): Promise<Prompt | undefined>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  updatePrompt(id: string, updates: Partial<Prompt>): Promise<Prompt>;
  
  // Courses
  getCourses(params?: {
    categoryId?: string;
    featured?: boolean;
    skillLevel?: string;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, updates: Partial<Course>): Promise<Course>;
  
  // Jobs
  getJobs(params?: {
    categoryId?: string;
    featured?: boolean;
    remote?: boolean;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, updates: Partial<Job>): Promise<Job>;
  
  // Models
  getModels(params?: {
    categoryId?: string;
    featured?: boolean;
    modelType?: string;
    accessType?: string;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<Model[]>;
  getModel(id: string): Promise<Model | undefined>;
  createModel(model: InsertModel): Promise<Model>;
  updateModel(id: string, updates: Partial<Model>): Promise<Model>;
  
  // Posts
  getPosts(params?: {
    categoryId?: string;
    featured?: boolean;
    status?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post>;
  
  // Comments
  getComments(itemType: string, itemId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Reviews
  getReviews(toolId: string, status?: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, updates: Partial<Review>): Promise<Review>;
  getAllReviewsForAdmin(status?: string): Promise<Review[]>;
  
  // Collections
  getCollections(userId?: string, isPublic?: boolean): Promise<Collection[]>;
  getCollection(id: string): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  
  // Bookmarks and Votes
  toggleBookmark(userId: string, itemType: string, itemId: string): Promise<boolean>;
  getUserBookmarks(userId: string, itemType?: string): Promise<any[]>;
  toggleVote(userId: string, itemType: string, itemId: string, voteType: number): Promise<boolean>;
  voteOnItem(userId: string, itemType: string, itemId: string, voteType: string): Promise<{
    userVote: 'up' | 'down' | null;
    upvotes: number;
    downvotes: number;
  }>;
  
  // Search
  searchAll(query: string, limit?: number): Promise<{
    tools: Tool[];
    prompts: Prompt[];
    courses: Course[];
    jobs: Job[];
    posts: Post[];
  }>;
  
  // Stats
  getStats(): Promise<{
    toolsCount: number;
    promptsCount: number;
    coursesCount: number;
    jobsCount: number;
    modelsCount: number;
    usersCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT - mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  // Tools
  async getTools(params: {
    categoryId?: string;
    featured?: boolean;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<Tool[]> {
    const {
      categoryId,
      featured,
      status = "approved",
      limit = 50,
      offset = 0,
      search,
    } = params;

    let query = db.select().from(tools);
    const conditions = [eq(tools.status, status as any)];

    if (categoryId) {
      conditions.push(eq(tools.categoryId, categoryId));
    }

    if (featured !== undefined) {
      conditions.push(eq(tools.featured, featured));
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      conditions.push(
        or(
          ilike(tools.name, `%${searchTerm}%`),
          ilike(tools.description, `%${searchTerm}%`)
        )!
      );
    }

    return await query
      .where(and(...conditions))
      .orderBy(desc(tools.upvotes), desc(tools.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getTool(id: string): Promise<Tool | undefined> {
    const [result] = await db
      .select({
        tool: tools,
        category: categories,
        submittedBy: users,
      })
      .from(tools)
      .leftJoin(categories, eq(tools.categoryId, categories.id))
      .leftJoin(users, eq(tools.submittedBy, users.id))
      .where(eq(tools.id, id));

    if (!result) return undefined;

    return {
      ...result.tool,
      category: result.category || undefined,
      submittedBy: result.submittedBy || undefined,
    } as Tool & {
      category?: typeof categories.$inferSelect;
      submittedBy?: typeof users.$inferSelect;
    };
  }

  async createTool(tool: InsertTool): Promise<Tool> {
    const [newTool] = await db.insert(tools).values(tool).returning();
    return newTool;
  }

  async updateTool(id: string, updates: Partial<Tool>): Promise<Tool> {
    const [updatedTool] = await db
      .update(tools)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tools.id, id))
      .returning();
    return updatedTool;
  }

  // Prompts
  async getPrompts(params: {
    categoryId?: string;
    featured?: boolean;
    isFree?: boolean;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<Prompt[]> {
    const {
      categoryId,
      featured,
      isFree,
      status = "approved",
      limit = 50,
      offset = 0,
      search,
    } = params;

    let query = db.select().from(prompts);
    const conditions = [eq(prompts.status, status as any)];

    if (categoryId) {
      conditions.push(eq(prompts.categoryId, categoryId));
    }

    if (featured !== undefined) {
      conditions.push(eq(prompts.featured, featured));
    }

    if (isFree !== undefined) {
      conditions.push(eq(prompts.isFree, isFree));
    }

    if (search) {
      conditions.push(
        or(
          ilike(prompts.title, `%${search}%`),
          ilike(prompts.description, `%${search}%`)
        )!
      );
    }

    return await query
      .where(and(...conditions))
      .orderBy(desc(prompts.upvotes), desc(prompts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPrompt(id: string): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    return prompt;
  }

  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const [newPrompt] = await db.insert(prompts).values(prompt).returning();
    return newPrompt;
  }

  async updatePrompt(id: string, updates: Partial<Prompt>): Promise<Prompt> {
    const [updatedPrompt] = await db
      .update(prompts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(prompts.id, id))
      .returning();
    return updatedPrompt;
  }

  // Courses
  async getCourses(params: {
    categoryId?: string;
    featured?: boolean;
    skillLevel?: string;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<Course[]> {
    const {
      categoryId,
      featured,
      skillLevel,
      status = "approved",
      limit = 50,
      offset = 0,
      search,
    } = params;

    let query = db.select().from(courses);
    const conditions = [eq(courses.status, status as any)];

    if (categoryId) {
      conditions.push(eq(courses.categoryId, categoryId));
    }

    if (featured !== undefined) {
      conditions.push(eq(courses.featured, featured));
    }

    if (skillLevel) {
      conditions.push(eq(courses.skillLevel, skillLevel as any));
    }

    if (search) {
      conditions.push(
        or(
          ilike(courses.title, `%${search}%`),
          ilike(courses.description, `%${search}%`)
        )!
      );
    }

    return await query
      .where(and(...conditions))
      .orderBy(desc(courses.upvotes), desc(courses.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  // Jobs
  async getJobs(params: {
    categoryId?: string;
    featured?: boolean;
    remote?: boolean;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<Job[]> {
    const {
      categoryId,
      featured,
      remote,
      status = "approved",
      limit = 50,
      offset = 0,
      search,
    } = params;

    let query = db.select().from(jobs);
    const conditions = [eq(jobs.status, status as any)];

    if (categoryId) {
      conditions.push(eq(jobs.categoryId, categoryId));
    }

    if (featured !== undefined) {
      conditions.push(eq(jobs.featured, featured));
    }

    if (remote !== undefined) {
      conditions.push(eq(jobs.remote, remote));
    }

    if (search) {
      conditions.push(
        or(
          ilike(jobs.title, `%${search}%`),
          ilike(jobs.description, `%${search}%`),
          ilike(jobs.company, `%${search}%`)
        )!
      );
    }

    return await query
      .where(and(...conditions))
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    const [updatedJob] = await db
      .update(jobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob;
  }

  // Models
  async getModels(params: {
    categoryId?: string;
    featured?: boolean;
    modelType?: string;
    accessType?: string;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<Model[]> {
    const {
      categoryId,
      featured,
      modelType,
      accessType,
      status = "approved",
      limit = 50,
      offset = 0,
      search,
    } = params;

    let query = db.select().from(models);
    const conditions = [eq(models.status, status as any)];

    if (categoryId) {
      conditions.push(eq(models.categoryId, categoryId));
    }

    if (featured !== undefined) {
      conditions.push(eq(models.featured, featured));
    }

    if (modelType) {
      conditions.push(eq(models.modelType, modelType as any));
    }

    if (accessType) {
      conditions.push(eq(models.accessType, accessType as any));
    }

    if (search) {
      conditions.push(
        or(
          ilike(models.name, `%${search}%`),
          ilike(models.description, `%${search}%`),
          ilike(models.developer, `%${search}%`)
        )!
      );
    }

    return await query
      .where(and(...conditions))
      .orderBy(desc(models.upvotes), desc(models.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getModel(id: string): Promise<Model | undefined> {
    const [model] = await db.select().from(models).where(eq(models.id, id));
    return model;
  }

  async createModel(model: InsertModel): Promise<Model> {
    const [newModel] = await db.insert(models).values(model).returning();
    return newModel;
  }

  async updateModel(id: string, updates: Partial<Model>): Promise<Model> {
    const [updatedModel] = await db
      .update(models)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(models.id, id))
      .returning();
    return updatedModel;
  }

  // Posts
  async getPosts(params: {
    categoryId?: string;
    featured?: boolean;
    status?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<Post[]> {
    const {
      categoryId,
      featured,
      status = "approved",
      authorId,
      limit = 50,
      offset = 0,
      search,
    } = params;

    let query = db.select().from(posts);
    const conditions = [eq(posts.status, status as any)];

    if (categoryId) {
      conditions.push(eq(posts.categoryId, categoryId));
    }

    if (featured !== undefined) {
      conditions.push(eq(posts.featured, featured));
    }

    if (authorId) {
      conditions.push(eq(posts.authorId, authorId));
    }

    if (search) {
      conditions.push(
        or(
          ilike(posts.title, `%${search}%`),
          ilike(posts.content, `%${search}%`)
        )!
      );
    }

    return await query
      .where(and(...conditions))
      .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    const [updatedPost] = await db
      .update(posts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return updatedPost;
  }

  // Comments
  async getComments(itemType: string, itemId: string): Promise<Comment[]> {
    const result = await db
      .select()
      .from(comments)
      .where(and(eq(comments.itemType, itemType as any), eq(comments.itemId, itemId)))
      .orderBy(desc(comments.createdAt));
    return result as Comment[];
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments).values(comment).returning();
    return result[0] as Comment;
  }

  // Reviews
  async getReviews(toolId: string, status?: string): Promise<Review[]> {
    const conditions = [eq(reviews.toolId, toolId)];
    
    if (status) {
      conditions.push(eq(reviews.status, status as any));
    }

    const result = await db
      .select({
        id: reviews.id,
        title: reviews.title,
        content: reviews.content,
        rating: reviews.rating,
        toolId: reviews.toolId,
        userId: reviews.userId,
        status: reviews.status,
        helpful: reviews.helpful,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(reviews.createdAt));

    return result.map(row => ({
      ...row,
      author: row.author.id ? row.author : undefined
    })) as Review[];
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    const [updatedReview] = await db
      .update(reviews)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return updatedReview;
  }

  async getAllReviewsForAdmin(status?: string): Promise<Review[]> {
    const conditions = [];
    
    if (status) {
      conditions.push(eq(reviews.status, status as any));
    }

    const result = await db
      .select({
        id: reviews.id,
        title: reviews.title,
        content: reviews.content,
        rating: reviews.rating,
        toolId: reviews.toolId,
        userId: reviews.userId,
        status: reviews.status,
        helpful: reviews.helpful,
        reported: reviews.reported,
        reportReason: reviews.reportReason,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        tool: {
          id: tools.id,
          name: tools.name,
        },
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .leftJoin(tools, eq(reviews.toolId, tools.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(reviews.createdAt));

    return result.map(row => ({
      ...row,
      tool: row.tool.id ? row.tool : undefined,
      author: row.author.id ? row.author : undefined
    })) as Review[];
  }

  async toggleReviewHelpful(reviewId: string, userId: string): Promise<{ helpful: number; userVoted: boolean }> {
    // Check if user already voted
    const existingVote = await db
      .select()
      .from(reviewVotes)
      .where(and(eq(reviewVotes.reviewId, reviewId), eq(reviewVotes.userId, userId)));

    if (existingVote.length > 0) {
      // Remove vote
      await db.delete(reviewVotes).where(and(eq(reviewVotes.reviewId, reviewId), eq(reviewVotes.userId, userId)));
      
      // Decrease helpful count
      const [updatedReview] = await db
        .update(reviews)
        .set({ helpful: sql`${reviews.helpful} - 1` })
        .where(eq(reviews.id, reviewId))
        .returning({ helpful: reviews.helpful });

      return { helpful: updatedReview.helpful, userVoted: false };
    } else {
      // Add vote
      await db.insert(reviewVotes).values({ reviewId, userId });
      
      // Increase helpful count
      const [updatedReview] = await db
        .update(reviews)
        .set({ helpful: sql`${reviews.helpful} + 1` })
        .where(eq(reviews.id, reviewId))
        .returning({ helpful: reviews.helpful });

      return { helpful: updatedReview.helpful, userVoted: true };
    }
  }

  async checkUserVotedReview(reviewId: string, userId: string): Promise<boolean> {
    const vote = await db
      .select()
      .from(reviewVotes)
      .where(and(eq(reviewVotes.reviewId, reviewId), eq(reviewVotes.userId, userId)));
    
    return vote.length > 0;
  }

  async getReportedReviews(): Promise<Review[]> {
    const result = await db
      .select({
        id: reviews.id,
        title: reviews.title,
        content: reviews.content,
        rating: reviews.rating,
        toolId: reviews.toolId,
        userId: reviews.userId,
        status: reviews.status,
        helpful: reviews.helpful,
        reported: reviews.reported,
        reportReason: reviews.reportReason,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        tool: {
          id: tools.id,
          name: tools.name,
        },
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .leftJoin(tools, eq(reviews.toolId, tools.id))
      .where(eq(reviews.reported, true))
      .orderBy(desc(reviews.updatedAt));

    return result.map(row => ({
      ...row,
      tool: row.tool.id ? row.tool : undefined,
      author: row.author.id ? row.author : undefined
    })) as Review[];
  }

  async reportReview(reviewId: string, reason: string): Promise<Review> {
    const [updatedReview] = await db
      .update(reviews)
      .set({ 
        reported: true, 
        reportReason: reason,
        updatedAt: new Date()
      })
      .where(eq(reviews.id, reviewId))
      .returning();
    
    return updatedReview;
  }

  // Collections
  async getCollections(userId?: string, isPublic?: boolean): Promise<Collection[]> {
    const conditions = [];

    if (userId) {
      conditions.push(eq(collections.ownerId, userId));
    }

    if (isPublic !== undefined) {
      conditions.push(eq(collections.isPublic, isPublic));
    }

    if (conditions.length > 0) {
      return await db
        .select()
        .from(collections)
        .where(and(...conditions))
        .orderBy(desc(collections.createdAt));
    }

    return await db
      .select()
      .from(collections)
      .orderBy(desc(collections.createdAt));
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.id, id));
    return collection;
  }

  async createCollection(collection: InsertCollection): Promise<Collection> {
    const [newCollection] = await db.insert(collections).values(collection).returning();
    return newCollection;
  }

  // Bookmarks and Votes
  async toggleBookmark(userId: string, itemType: string, itemId: string): Promise<boolean> {
    const existing = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.itemType, itemType as any),
          eq(bookmarks.itemId, itemId)
        )
      );

    if (existing.length > 0) {
      await db
        .delete(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, userId),
            eq(bookmarks.itemType, itemType as any),
            eq(bookmarks.itemId, itemId)
          )
        );
      return false;
    } else {
      await db.insert(bookmarks).values({
        userId,
        itemType: itemType as any,
        itemId,
      });
      return true;
    }
  }

  async getUserBookmarks(userId: string, itemType?: string): Promise<any[]> {
    const conditions = [eq(bookmarks.userId, userId)];

    if (itemType) {
      conditions.push(eq(bookmarks.itemType, itemType as any));
    }

    const userBookmarks = await db
      .select({
        bookmark: bookmarks,
        tool: tools,
        prompt: prompts,
        course: courses,
        job: jobs,
        model: models,
        post: posts,
      })
      .from(bookmarks)
      .leftJoin(tools, and(
        eq(bookmarks.itemType, 'tool'),
        eq(bookmarks.itemId, tools.id)
      ))
      .leftJoin(prompts, and(
        eq(bookmarks.itemType, 'prompt'),
        eq(bookmarks.itemId, prompts.id)
      ))
      .leftJoin(courses, and(
        eq(bookmarks.itemType, 'course'),
        eq(bookmarks.itemId, courses.id)
      ))
      .leftJoin(jobs, and(
        eq(bookmarks.itemType, 'job'),
        eq(bookmarks.itemId, jobs.id)
      ))
      .leftJoin(models, and(
        eq(bookmarks.itemType, 'model'),
        eq(bookmarks.itemId, models.id)
      ))
      .leftJoin(posts, and(
        eq(bookmarks.itemType, 'post'),
        eq(bookmarks.itemId, posts.id)
      ))
      .where(and(...conditions))
      .orderBy(desc(bookmarks.createdAt));

    return userBookmarks.map(row => ({
      ...row.bookmark,
      item: row.tool || row.prompt || row.course || row.job || row.model || row.post
    }));
  }

  async voteOnItem(userId: string, itemType: string, itemId: string, voteType: string): Promise<{
    userVote: 'up' | 'down' | null;
    upvotes: number;
    downvotes: number;
  }> {
    const voteValue = voteType === 'up' ? 1 : -1;
    
    // Check existing vote
    const existing = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.userId, userId),
          eq(votes.itemType, itemType as any),
          eq(votes.itemId, itemId)
        )
      );

    if (existing.length > 0) {
      if (existing[0].voteType === voteValue) {
        // Remove vote if clicking same button
        await db
          .delete(votes)
          .where(
            and(
              eq(votes.userId, userId),
              eq(votes.itemType, itemType as any),
              eq(votes.itemId, itemId)
            )
          );
      } else {
        // Update vote if clicking different button
        await db
          .update(votes)
          .set({ voteType: voteValue })
          .where(
            and(
              eq(votes.userId, userId),
              eq(votes.itemType, itemType as any),
              eq(votes.itemId, itemId)
            )
          );
      }
    } else {
      // Create new vote
      await db.insert(votes).values({
        userId,
        itemType: itemType as any,
        itemId,
        voteType: voteValue,
      });
    }

    // Get updated vote counts
    const upvotes = await db
      .select({ count: count() })
      .from(votes)
      .where(
        and(
          eq(votes.itemType, itemType as any),
          eq(votes.itemId, itemId),
          eq(votes.voteType, 1)
        )
      );

    const downvotes = await db
      .select({ count: count() })
      .from(votes)
      .where(
        and(
          eq(votes.itemType, itemType as any),
          eq(votes.itemId, itemId),
          eq(votes.voteType, -1)
        )
      );

    // Update the actual item's upvote count in the respective table
    const upvoteCount = upvotes[0]?.count || 0;
    
    try {
      if (itemType === 'tool') {
        await db
          .update(tools)
          .set({ upvotes: upvoteCount })
          .where(eq(tools.id, itemId));
      } else if (itemType === 'prompt') {
        await db
          .update(prompts)
          .set({ upvotes: upvoteCount })
          .where(eq(prompts.id, itemId));
      } else if (itemType === 'course') {
        await db
          .update(courses)
          .set({ upvotes: upvoteCount })
          .where(eq(courses.id, itemId));
      } else if (itemType === 'job') {
        await db
          .update(jobs)
          .set({ upvotes: upvoteCount })
          .where(eq(jobs.id, itemId));
      } else if (itemType === 'model') {
        await db
          .update(models)
          .set({ upvotes: upvoteCount })
          .where(eq(models.id, itemId));
      } else if (itemType === 'post') {
        await db
          .update(posts)
          .set({ upvotes: upvoteCount })
          .where(eq(posts.id, itemId));
      }
    } catch (error) {
      console.error('Error updating item upvote count:', error);
    }

    // Get current user's vote
    const currentVote = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.userId, userId),
          eq(votes.itemType, itemType as any),
          eq(votes.itemId, itemId)
        )
      );

    const userVote = currentVote.length > 0 
      ? (currentVote[0].voteType === 1 ? 'up' : 'down')
      : null;

    return {
      userVote,
      upvotes: upvoteCount,
      downvotes: downvotes[0]?.count || 0,
    };
  }

  async toggleVote(userId: string, itemType: string, itemId: string, voteType: number): Promise<boolean> {
    const existing = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.userId, userId),
          eq(votes.itemType, itemType as any),
          eq(votes.itemId, itemId)
        )
      );

    if (existing.length > 0) {
      if (existing[0].voteType === voteType) {
        // Remove vote
        await db
          .delete(votes)
          .where(
            and(
              eq(votes.userId, userId),
              eq(votes.itemType, itemType as any),
              eq(votes.itemId, itemId)
            )
          );
        return false;
      } else {
        // Update vote
        await db
          .update(votes)
          .set({ voteType })
          .where(
            and(
              eq(votes.userId, userId),
              eq(votes.itemType, itemType as any),
              eq(votes.itemId, itemId)
            )
          );
        return true;
      }
    } else {
      // Create new vote
      await db.insert(votes).values({
        userId,
        itemType: itemType as any,
        itemId,
        voteType,
      });
      return true;
    }
  }

  // Search
  async searchAll(query: string, limit: number = 10): Promise<{
    tools: Tool[];
    prompts: Prompt[];
    courses: Course[];
    jobs: Job[];
    models: Model[];
    posts: Post[];
  }> {
    const searchCondition = `%${query}%`;

    const [toolResults, promptResults, courseResults, jobResults, modelResults, postResults] = await Promise.all([
      db
        .select()
        .from(tools)
        .where(
          and(
            eq(tools.status, "approved"),
            or(
              ilike(tools.name, searchCondition),
              ilike(tools.description, searchCondition)
            )!
          )
        )
        .limit(limit),
      db
        .select()
        .from(prompts)
        .where(
          and(
            eq(prompts.status, "approved"),
            or(
              ilike(prompts.title, searchCondition),
              ilike(prompts.description, searchCondition)
            )!
          )
        )
        .limit(limit),
      db
        .select()
        .from(courses)
        .where(
          and(
            eq(courses.status, "approved"),
            or(
              ilike(courses.title, searchCondition),
              ilike(courses.description, searchCondition)
            )!
          )
        )
        .limit(limit),
      db
        .select()
        .from(jobs)
        .where(
          and(
            eq(jobs.status, "approved"),
            or(
              ilike(jobs.title, searchCondition),
              ilike(jobs.description, searchCondition),
              ilike(jobs.company, searchCondition)
            )!
          )
        )
        .limit(limit),
      db
        .select()
        .from(models)
        .where(
          and(
            eq(models.status, "approved"),
            or(
              ilike(models.name, searchCondition),
              ilike(models.description, searchCondition),
              ilike(models.developer, searchCondition)
            )!
          )
        )
        .limit(limit),
      db
        .select()
        .from(posts)
        .where(
          and(
            eq(posts.status, "approved"),
            or(
              ilike(posts.title, searchCondition),
              ilike(posts.content, searchCondition)
            )!
          )
        )
        .limit(limit),
    ]);

    return {
      tools: toolResults,
      prompts: promptResults,
      courses: courseResults,
      jobs: jobResults,
      models: modelResults,
      posts: postResults,
    };
  }

  // Stats
  async getStats(): Promise<{
    toolsCount: number;
    promptsCount: number;
    coursesCount: number;
    jobsCount: number;
    modelsCount: number;
    usersCount: number;
  }> {
    const [toolsCount, promptsCount, coursesCount, jobsCount, modelsCount, usersCount] = await Promise.all([
      db
        .select({ count: count() })
        .from(tools)
        .where(eq(tools.status, "approved")),
      db
        .select({ count: count() })
        .from(prompts)
        .where(eq(prompts.status, "approved")),
      db
        .select({ count: count() })
        .from(courses)
        .where(eq(courses.status, "approved")),
      db
        .select({ count: count() })
        .from(jobs)
        .where(eq(jobs.status, "approved")),
      db
        .select({ count: count() })
        .from(models)
        .where(eq(models.status, "approved")),
      db.select({ count: count() }).from(users),
    ]);

    return {
      toolsCount: toolsCount[0].count,
      promptsCount: promptsCount[0].count,
      coursesCount: coursesCount[0].count,
      jobsCount: jobsCount[0].count,
      modelsCount: modelsCount[0].count,
      usersCount: usersCount[0].count,
    };
  }

  // Prompt marketplace operations
  async getAllPromptsForAdmin(): Promise<Prompt[]> {
    return await db.select().from(prompts).orderBy(desc(prompts.createdAt));
  }

  async createPrompt(promptData: InsertPrompt): Promise<Prompt> {
    const [prompt] = await db.insert(prompts).values(promptData).returning();
    return prompt;
  }

  async updatePrompt(id: string, promptData: Partial<InsertPrompt>): Promise<Prompt> {
    const [prompt] = await db
      .update(prompts)
      .set({ ...promptData, updatedAt: new Date() })
      .where(eq(prompts.id, id))
      .returning();
    return prompt;
  }

  async deletePrompt(id: string): Promise<void> {
    await db.delete(prompts).where(eq(prompts.id, id));
  }

  async createPromptPurchase(purchaseData: InsertPromptPurchase): Promise<PromptPurchase> {
    const [purchase] = await db.insert(promptPurchases).values(purchaseData).returning();
    return purchase;
  }

  async updatePromptPurchaseStatus(paymentIntentId: string, status: string): Promise<void> {
    await db
      .update(promptPurchases)
      .set({ status })
      .where(eq(promptPurchases.stripePaymentIntentId, paymentIntentId));
  }

  async getUserPromptPurchases(userId: string): Promise<PromptPurchase[]> {
    return await db
      .select()
      .from(promptPurchases)
      .where(eq(promptPurchases.userId, userId));
  }

  async hasUserPurchasedPrompt(userId: string, promptId: string): Promise<boolean> {
    const [purchase] = await db
      .select()
      .from(promptPurchases)
      .where(
        and(
          eq(promptPurchases.userId, userId),
          eq(promptPurchases.promptId, promptId),
          eq(promptPurchases.status, "completed")
        )
      );
    return !!purchase;
  }
}

export const storage = new DatabaseStorage();
