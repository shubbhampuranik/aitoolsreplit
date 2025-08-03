import { db } from "./db";
import { 
  categories, 
  tools, 
  prompts, 
  courses, 
  jobs, 
  posts 
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create categories
    console.log("📁 Creating categories...");
    const categoryData = [
      {
        name: "Text Generation",
        description: "AI tools for generating written content, articles, and copy",
        icon: "FileText",
        color: "#3b82f6",
        slug: "text-generation"
      },
      {
        name: "Image Generation",
        description: "AI-powered image creation and editing tools",
        icon: "Image",
        color: "#8b5cf6",
        slug: "image-generation"
      },
      {
        name: "Code Assistant",
        description: "AI tools for coding, debugging, and development",
        icon: "Code",
        color: "#10b981",
        slug: "code-assistant"
      },
      {
        name: "Video & Audio",
        description: "AI tools for video and audio processing",
        icon: "Video",
        color: "#f59e0b",
        slug: "video-audio"
      },
      {
        name: "Business & Marketing",
        description: "AI solutions for business operations and marketing",
        icon: "TrendingUp",
        color: "#ef4444",
        slug: "business-marketing"
      },
      {
        name: "Education & Research",
        description: "AI tools for learning, research, and knowledge management",
        icon: "BookOpen",
        color: "#06b6d4",
        slug: "education-research"
      }
    ];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`✅ Created ${insertedCategories.length} categories`);

    // Create sample tools
    console.log("🔧 Creating sample tools...");
    const toolsData = [
      {
        name: "ChatGPT",
        description: "OpenAI's conversational AI assistant that can help with writing, analysis, coding, and creative tasks. Features advanced reasoning capabilities and can maintain context across long conversations.",
        shortDescription: "Advanced conversational AI assistant by OpenAI for various tasks",
        url: "https://chat.openai.com",
        logoUrl: "https://cdn.openai.com/images/favicon-32x32.png",
        pricingType: "freemium" as const,
        pricingDetails: "Free tier available, ChatGPT Plus at $20/month",
        categoryId: insertedCategories.find(c => c.slug === "text-generation")?.id,
        status: "approved" as const,
        featured: true,
        upvotes: 1250,
        views: 15420,
        rating: "4.8",
        ratingCount: 892,
        socialLinks: {
          twitter: "https://twitter.com/OpenAI",
          website: "https://openai.com"
        },
        prosAndCons: {
          pros: ["Highly accurate responses", "Great for creative writing", "Excellent code assistance"],
          cons: ["Requires subscription for latest model", "Can have knowledge cutoffs"]
        }
      },
      {
        name: "Midjourney",
        description: "AI art generator that creates stunning, high-quality images from text descriptions. Known for its artistic style and ability to produce creative, dreamlike visuals.",
        shortDescription: "AI art generator creating stunning images from text prompts",
        url: "https://midjourney.com",
        logoUrl: "https://www.midjourney.com/favicon.ico",
        pricingType: "paid" as const,
        pricingDetails: "Plans start at $10/month for 200 generations",
        categoryId: insertedCategories.find(c => c.slug === "image-generation")?.id,
        status: "approved" as const,
        featured: true,
        upvotes: 980,
        views: 12300,
        rating: "4.7",
        ratingCount: 654
      },
      {
        name: "GitHub Copilot",
        description: "AI-powered code completion tool that suggests entire lines or blocks of code as you type. Trained on billions of lines of code to help developers write better code faster.",
        shortDescription: "AI code completion assistant integrated into your IDE",
        url: "https://github.com/features/copilot",
        logoUrl: "https://github.githubassets.com/images/modules/site/copilot/copilot-logo.png",
        pricingType: "paid" as const,
        pricingDetails: "$10/month for individuals, free for students",
        categoryId: insertedCategories.find(c => c.slug === "code-assistant")?.id,
        status: "approved" as const,
        upvotes: 856,
        views: 9876,
        rating: "4.6",
        ratingCount: 423
      },
      {
        name: "Runway ML",
        description: "Creative AI toolkit for video editing, image generation, and multimedia content creation. Offers advanced AI models for creative professionals.",
        shortDescription: "AI-powered creative toolkit for video and image generation",
        url: "https://runwayml.com",
        logoUrl: "https://runwayml.com/favicon.ico",
        pricingType: "freemium" as const,
        pricingDetails: "Free tier with limited credits, paid plans from $15/month",
        categoryId: insertedCategories.find(c => c.slug === "video-audio")?.id,
        status: "approved" as const,
        upvotes: 543,
        views: 7234,
        rating: "4.5",
        ratingCount: 287
      },
      {
        name: "Jasper AI",
        description: "AI writing assistant designed for marketing teams and content creators. Specializes in creating marketing copy, blog posts, and business content.",
        shortDescription: "AI writing assistant for marketing and business content",
        url: "https://jasper.ai",
        logoUrl: "https://www.jasper.ai/favicon.ico",
        pricingType: "paid" as const,
        pricingDetails: "Plans start at $39/month",
        categoryId: insertedCategories.find(c => c.slug === "business-marketing")?.id,
        status: "approved" as const,
        upvotes: 432,
        views: 5678,
        rating: "4.4",
        ratingCount: 234
      }
    ];

    const insertedTools = await db.insert(tools).values(toolsData).returning();
    console.log(`✅ Created ${insertedTools.length} tools`);

    // Create sample prompts
    console.log("💡 Creating sample prompts...");
    const promptsData = [
      {
        title: "Professional Email Generator",
        description: "Generate professional emails for various business scenarios including follow-ups, proposals, and client communications.",
        content: "You are a professional email writing assistant. Write a [EMAIL_TYPE] email to [RECIPIENT] about [SUBJECT]. Keep the tone [TONE] and make it [LENGTH]. Include relevant details and a clear call to action.",
        type: "chatgpt" as const,
        categoryId: insertedCategories.find(c => c.slug === "business-marketing")?.id,
        price: "0.00",
        isFree: true,
        outputExamples: [
          "Professional follow-up email after a meeting",
          "Proposal submission email to potential client"
        ],
        status: "approved" as const,
        featured: true,
        upvotes: 234,
        views: 1876,
        downloads: 145
      },
      {
        title: "Creative Story Starter",
        description: "Generate engaging story beginnings for creative writing, novels, or short stories across various genres.",
        content: "Create an engaging opening paragraph for a [GENRE] story. The story should feature [MAIN_CHARACTER] in [SETTING]. Include a hook that [HOOK_TYPE]. Make it approximately [LENGTH] words.",
        type: "chatgpt" as const,
        categoryId: insertedCategories.find(c => c.slug === "text-generation")?.id,
        price: "2.99",
        isFree: false,
        outputExamples: [
          "Mystery novel opening in Victorian London",
          "Sci-fi adventure beginning on Mars"
        ],
        status: "approved" as const,
        upvotes: 189,
        views: 1234,
        downloads: 78
      },
      {
        title: "Code Documentation Helper",
        description: "Generate comprehensive documentation for your code including function descriptions, parameter explanations, and usage examples.",
        content: "Generate clear and comprehensive documentation for this code: [CODE]. Include: 1) Brief description of what it does, 2) Parameter explanations, 3) Return value description, 4) Usage example, 5) Any important notes or warnings.",
        type: "chatgpt" as const,
        categoryId: insertedCategories.find(c => c.slug === "code-assistant")?.id,
        price: "0.00",
        isFree: true,
        outputExamples: [
          "Python function documentation",
          "JavaScript class documentation"
        ],
        status: "approved" as const,
        upvotes: 167,
        views: 987,
        downloads: 92
      }
    ];

    const insertedPrompts = await db.insert(prompts).values(promptsData).returning();
    console.log(`✅ Created ${insertedPrompts.length} prompts`);

    // Create sample courses
    console.log("📚 Creating sample courses...");
    const coursesData = [
      {
        title: "Introduction to AI and Machine Learning",
        description: "Comprehensive course covering the fundamentals of artificial intelligence and machine learning. Perfect for beginners looking to understand AI concepts and applications.",
        instructor: "Dr. Sarah Chen",
        platform: "Coursera",
        url: "https://www.coursera.org/learn/machine-learning",
        thumbnailUrl: "https://d3c33hcgiwev3.cloudfront.net/imageAssetProxy.v1/ml-course.jpg",
        price: "49.00",
        duration: "8 weeks",
        skillLevel: "beginner" as const,
        categoryId: insertedCategories.find(c => c.slug === "education-research")?.id,
        status: "approved" as const,
        featured: true,
        upvotes: 456,
        views: 3456,
        rating: "4.7",
        ratingCount: 234
      },
      {
        title: "Advanced Prompt Engineering",
        description: "Master the art of crafting effective prompts for AI models. Learn advanced techniques for getting better results from ChatGPT, Claude, and other AI systems.",
        instructor: "Alex Rodriguez",
        platform: "Udemy",
        url: "https://www.udemy.com/course/prompt-engineering",
        thumbnailUrl: "https://img-c.udemycdn.com/course/750x422/prompt-engineering.jpg",
        price: "79.99",
        duration: "6 weeks",
        skillLevel: "intermediate" as const,
        categoryId: insertedCategories.find(c => c.slug === "text-generation")?.id,
        status: "approved" as const,
        upvotes: 312,
        views: 2345,
        rating: "4.6",
        ratingCount: 189
      },
      {
        title: "AI for Business Leaders",
        description: "Strategic course for executives and managers on implementing AI solutions in business. Covers ROI, ethics, and practical applications.",
        instructor: "Prof. Michael Johnson",
        platform: "LinkedIn Learning",
        url: "https://www.linkedin.com/learning/ai-for-business-leaders",
        thumbnailUrl: "https://media.licdn.com/dms/image/ai-business.jpg",
        price: "0.00",
        duration: "4 weeks",
        skillLevel: "beginner" as const,
        categoryId: insertedCategories.find(c => c.slug === "business-marketing")?.id,
        status: "approved" as const,
        upvotes: 234,
        views: 1876,
        rating: "4.5",
        ratingCount: 123
      }
    ];

    const insertedCourses = await db.insert(courses).values(coursesData).returning();
    console.log(`✅ Created ${insertedCourses.length} courses`);

    // Create sample jobs
    console.log("💼 Creating sample jobs...");
    const jobsData = [
      {
        title: "Senior AI Engineer",
        company: "TechCorp Inc.",
        description: "We're looking for a Senior AI Engineer to join our machine learning team. You'll work on cutting-edge AI projects and help build the next generation of intelligent systems. Requirements include 5+ years of experience with Python, TensorFlow, and deep learning frameworks.",
        location: "San Francisco, CA",
        remote: true,
        salary: "$150,000 - $200,000",
        applyUrl: "https://jobs.techcorp.com/ai-engineer",
        companyLogo: "https://techcorp.com/logo.png",
        categoryId: insertedCategories.find(c => c.slug === "code-assistant")?.id,
        status: "approved" as const,
        featured: true,
        views: 1234,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      {
        title: "AI Product Manager",
        company: "InnovateLabs",
        description: "Join our product team to lead AI-powered product initiatives. You'll work closely with engineering and design teams to define product requirements and go-to-market strategies for AI features.",
        location: "New York, NY",
        remote: false,
        salary: "$130,000 - $170,000",
        applyUrl: "https://careers.innovatelabs.com/product-manager",
        companyLogo: "https://innovatelabs.com/logo.png",
        categoryId: insertedCategories.find(c => c.slug === "business-marketing")?.id,
        status: "approved" as const,
        views: 876,
        expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Machine Learning Research Scientist",
        company: "AI Research Institute",
        description: "Conduct cutting-edge research in machine learning and artificial intelligence. Publish papers, attend conferences, and collaborate with top researchers in the field. PhD in Computer Science or related field required.",
        location: "Boston, MA",
        remote: true,
        salary: "$180,000 - $250,000",
        applyUrl: "https://ai-institute.org/careers/research-scientist",
        companyLogo: "https://ai-institute.org/logo.png",
        categoryId: insertedCategories.find(c => c.slug === "education-research")?.id,
        status: "approved" as const,
        views: 654,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      }
    ];

    const insertedJobs = await db.insert(jobs).values(jobsData).returning();
    console.log(`✅ Created ${insertedJobs.length} jobs`);

    // Create sample posts
    console.log("📝 Creating sample posts...");
    const postsData = [
      {
        title: "The Future of AI in 2024: What to Expect",
        content: "As we advance through 2024, artificial intelligence continues to evolve at an unprecedented pace. From breakthrough language models to revolutionary image generation tools, the AI landscape is constantly shifting...\n\nIn this comprehensive analysis, we'll explore the key trends shaping AI development this year, including:\n\n1. **Multimodal AI Systems**: The integration of text, image, and audio processing\n2. **Improved Efficiency**: Smaller models with better performance\n3. **Enterprise Adoption**: How businesses are implementing AI solutions\n4. **Ethical AI Development**: Focus on responsible AI practices\n\nThe emergence of more sophisticated AI tools has democratized access to artificial intelligence, making it easier for businesses and individuals to leverage these powerful technologies...",
        excerpt: "Explore the key AI trends and developments shaping 2024, from multimodal systems to enterprise adoption.",
        coverImage: "https://example.com/ai-future-2024.jpg",
        slug: "future-of-ai-2024",
        categoryId: insertedCategories.find(c => c.slug === "education-research")?.id,
        status: "approved" as const,
        featured: true,
        upvotes: 189,
        views: 2456,
        publishedAt: new Date()
      },
      {
        title: "How to Choose the Right AI Tool for Your Business",
        content: "With hundreds of AI tools available in the market, selecting the right one for your business can be overwhelming. This guide will help you navigate the decision-making process...\n\n## Key Factors to Consider\n\n### 1. Define Your Use Case\nBefore evaluating tools, clearly define what you want to achieve with AI. Are you looking to:\n- Automate customer service?\n- Generate content?\n- Analyze data?\n- Improve productivity?\n\n### 2. Evaluate Your Budget\nAI tools range from free options to enterprise solutions costing thousands per month...",
        excerpt: "A comprehensive guide to selecting the perfect AI tool for your business needs and budget.",
        coverImage: "https://example.com/choose-ai-tool.jpg",
        slug: "choose-right-ai-tool-business",
        categoryId: insertedCategories.find(c => c.slug === "business-marketing")?.id,
        status: "approved" as const,
        upvotes: 145,
        views: 1876,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ];

    const insertedPosts = await db.insert(posts).values(postsData).returning();
    console.log(`✅ Created ${insertedPosts.length} posts`);

    // Update category tool counts
    console.log("🔄 Updating category statistics...");
    for (const category of insertedCategories) {
      const toolCount = await db.select({ count: sql<number>`count(*)` })
        .from(tools)
        .where(eq(tools.categoryId, category.id))
        .then(result => result[0]?.count || 0);
      
      await db.update(categories)
        .set({ toolCount })
        .where(eq(categories.id, category.id));
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log("📊 Summary:");
    console.log(`  - ${insertedCategories.length} categories created`);
    console.log(`  - ${insertedTools.length} tools created`);
    console.log(`  - ${insertedPrompts.length} prompts created`);
    console.log(`  - ${insertedCourses.length} courses created`);
    console.log(`  - ${insertedJobs.length} jobs created`);
    console.log(`  - ${insertedPosts.length} posts created`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };