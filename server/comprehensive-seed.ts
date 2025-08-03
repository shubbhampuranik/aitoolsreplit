import { db } from "./db";
import { 
  categories, 
  tools, 
  prompts, 
  courses, 
  jobs, 
  posts,
  models
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

async function seedDatabase() {
  console.log("🌱 Starting comprehensive database seeding...");

  try {
    // Create categories first
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
      },
      {
        name: "AI Models",
        description: "Large language models and AI foundation models",
        icon: "Brain",
        color: "#f97316",
        slug: "ai-models"
      },
      {
        name: "Data & Analytics",
        description: "AI-powered data analysis and business intelligence tools",
        icon: "BarChart3",
        color: "#84cc16",
        slug: "data-analytics"
      }
    ];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`✅ Created ${insertedCategories.length} categories`);

    // Create 50+ AI Tools
    console.log("🔧 Creating AI tools...");
    const toolsData = [];
    const textGenCat = insertedCategories.find(c => c.slug === "text-generation")?.id;
    const imageGenCat = insertedCategories.find(c => c.slug === "image-generation")?.id;
    const codeCat = insertedCategories.find(c => c.slug === "code-assistant")?.id;
    const videoCat = insertedCategories.find(c => c.slug === "video-audio")?.id;
    const businessCat = insertedCategories.find(c => c.slug === "business-marketing")?.id;
    const eduCat = insertedCategories.find(c => c.slug === "education-research")?.id;
    const dataCat = insertedCategories.find(c => c.slug === "data-analytics")?.id;

    // Text Generation Tools (15 tools)
    const textGenTools = [
      {
        name: "ChatGPT",
        description: "OpenAI's conversational AI assistant that can help with writing, analysis, coding, and creative tasks. Features advanced reasoning capabilities and can maintain context across long conversations.",
        shortDescription: "Advanced conversational AI assistant by OpenAI",
        url: "https://chat.openai.com",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/120px-ChatGPT_logo.svg.png",
        pricingType: "freemium" as const,
        pricingDetails: "Free tier available, ChatGPT Plus at $20/month",
        categoryId: textGenCat,
        status: "approved" as const,
        featured: true,
        upvotes: 1250,
        views: 15420,
        rating: "4.8",
        ratingCount: 892
      },
      {
        name: "Claude",
        description: "Anthropic's AI assistant focused on helpful, harmless, and honest interactions. Excellent for analysis, writing, and complex reasoning tasks.",
        shortDescription: "Anthropic's helpful AI assistant for analysis and writing",
        url: "https://claude.ai",
        logoUrl: "https://www.anthropic.com/favicon.ico",
        pricingType: "freemium" as const,
        pricingDetails: "Free tier with Pro at $20/month",
        categoryId: textGenCat,
        status: "approved" as const,
        featured: true,
        upvotes: 980,
        views: 12300,
        rating: "4.7",
        ratingCount: 654
      },
      {
        name: "Jasper AI",
        description: "AI writing assistant designed for marketing teams and content creators. Specializes in creating marketing copy, blog posts, and business content.",
        shortDescription: "AI writing assistant for marketing and business content",
        url: "https://jasper.ai",
        logoUrl: "https://www.jasper.ai/favicon.ico",
        pricingType: "paid" as const,
        pricingDetails: "Plans start at $39/month",
        categoryId: textGenCat,
        status: "approved" as const,
        upvotes: 432,
        views: 5678,
        rating: "4.4",
        ratingCount: 234
      },
      {
        name: "Copy.ai",
        description: "AI-powered copywriting tool that helps create marketing content, social media posts, and sales copy at scale.",
        shortDescription: "AI copywriting tool for marketing content creation",
        url: "https://copy.ai",
        pricingType: "freemium" as const,
        categoryId: textGenCat,
        status: "approved" as const,
        upvotes: 387,
        views: 4521,
        rating: "4.3",
        ratingCount: 198
      },
      {
        name: "Writesonic",
        description: "AI writing platform that generates articles, ads, landing pages, and product descriptions for businesses and marketers.",
        shortDescription: "AI writing platform for articles and marketing content",
        url: "https://writesonic.com",
        pricingType: "freemium" as const,
        categoryId: textGenCat,
        status: "approved" as const,
        upvotes: 298,
        views: 3876,
        rating: "4.2",
        ratingCount: 145
      }
    ];

    // Add more text generation tools to reach 15
    for (let i = 6; i <= 15; i++) {
      textGenTools.push({
        name: `TextGen Tool ${i}`,
        description: `Advanced AI text generation tool #${i} for creating high-quality content across various domains and use cases.`,
        shortDescription: `AI text generator #${i} for content creation`,
        url: `https://textgen${i}.ai`,
        pricingType: Math.random() > 0.5 ? "freemium" as const : "paid" as const,
        categoryId: textGenCat,
        status: "approved" as const,
        upvotes: Math.floor(Math.random() * 500) + 50,
        views: Math.floor(Math.random() * 5000) + 500,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        ratingCount: Math.floor(Math.random() * 200) + 50
      });
    }

    // Image Generation Tools (15 tools)
    const imageGenTools = [
      {
        name: "Midjourney",
        description: "AI art generator that creates stunning, high-quality images from text descriptions. Known for its artistic style and ability to produce creative, dreamlike visuals.",
        shortDescription: "AI art generator creating stunning images from text prompts",
        url: "https://midjourney.com",
        logoUrl: "https://www.midjourney.com/favicon.ico",
        pricingType: "paid" as const,
        pricingDetails: "Plans start at $10/month for 200 generations",
        categoryId: imageGenCat,
        status: "approved" as const,
        featured: true,
        upvotes: 1180,
        views: 14200,
        rating: "4.7",
        ratingCount: 756
      },
      {
        name: "DALL-E 3",
        description: "OpenAI's latest image generation model that creates highly detailed and accurate images from text descriptions.",
        shortDescription: "OpenAI's advanced AI image generator",
        url: "https://openai.com/dall-e-3",
        logoUrl: "https://openai.com/favicon.ico",
        pricingType: "paid" as const,
        categoryId: imageGenCat,
        status: "approved" as const,
        featured: true,
        upvotes: 890,
        views: 11340,
        rating: "4.6",
        ratingCount: 423
      },
      {
        name: "Stable Diffusion",
        description: "Open-source AI image generator that runs locally or in the cloud. Highly customizable with various models and fine-tuning options.",
        shortDescription: "Open-source AI image generation with customization",
        url: "https://stability.ai",
        pricingType: "free" as const,
        categoryId: imageGenCat,
        status: "approved" as const,
        featured: true,
        upvotes: 756,
        views: 9876,
        rating: "4.5",
        ratingCount: 634
      }
    ];

    // Add more image generation tools
    for (let i = 4; i <= 15; i++) {
      imageGenTools.push({
        name: `ImageAI ${i}`,
        description: `AI-powered image generation tool #${i} for creating unique visuals, artwork, and design assets.`,
        shortDescription: `AI image generator #${i} for visual content`,
        url: `https://imageai${i}.com`,
        pricingType: Math.random() > 0.3 ? "freemium" as const : "paid" as const,
        categoryId: imageGenCat,
        status: "approved" as const,
        upvotes: Math.floor(Math.random() * 600) + 100,
        views: Math.floor(Math.random() * 8000) + 1000,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        ratingCount: Math.floor(Math.random() * 300) + 80
      });
    }

    // Code Assistant Tools (10 tools)
    const codeTools = [
      {
        name: "GitHub Copilot",
        description: "AI-powered code completion tool that suggests entire lines or blocks of code as you type. Trained on billions of lines of code to help developers write better code faster.",
        shortDescription: "AI code completion assistant integrated into your IDE",
        url: "https://github.com/features/copilot",
        logoUrl: "https://github.githubassets.com/images/modules/site/copilot/copilot-logo.png",
        pricingType: "paid" as const,
        pricingDetails: "$10/month for individuals, free for students",
        categoryId: codeCat,
        status: "approved" as const,
        featured: true,
        upvotes: 856,
        views: 9876,
        rating: "4.6",
        ratingCount: 423
      },
      {
        name: "Cursor",
        description: "AI-first code editor that understands your codebase and helps you write, edit, and debug code more efficiently.",
        shortDescription: "AI-first code editor for enhanced development",
        url: "https://cursor.sh",
        pricingType: "freemium" as const,
        categoryId: codeCat,
        status: "approved" as const,
        featured: true,
        upvotes: 634,
        views: 7234,
        rating: "4.5",
        ratingCount: 287
      }
    ];

    // Add more code tools
    for (let i = 3; i <= 10; i++) {
      codeTools.push({
        name: `CodeAI ${i}`,
        description: `AI coding assistant #${i} that helps with code generation, debugging, and optimization across multiple programming languages.`,
        shortDescription: `AI coding assistant #${i} for development`,
        url: `https://codeai${i}.dev`,
        pricingType: Math.random() > 0.4 ? "freemium" as const : "paid" as const,
        categoryId: codeCat,
        status: "approved" as const,
        upvotes: Math.floor(Math.random() * 400) + 100,
        views: Math.floor(Math.random() * 6000) + 800,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        ratingCount: Math.floor(Math.random() * 250) + 60
      });
    }

    // Video & Audio Tools (8 tools)
    const videoAudioTools = [
      {
        name: "Runway ML",
        description: "Creative AI toolkit for video editing, image generation, and multimedia content creation. Offers advanced AI models for creative professionals.",
        shortDescription: "AI-powered creative toolkit for video and image generation",
        url: "https://runwayml.com",
        logoUrl: "https://runwayml.com/favicon.ico",
        pricingType: "freemium" as const,
        pricingDetails: "Free tier with limited credits, paid plans from $15/month",
        categoryId: videoCat,
        status: "approved" as const,
        featured: true,
        upvotes: 543,
        views: 7234,
        rating: "4.5",
        ratingCount: 287
      },
      {
        name: "Descript",
        description: "AI-powered video and audio editing tool that allows you to edit content by editing text transcripts.",
        shortDescription: "Text-based video and audio editing with AI",
        url: "https://descript.com",
        pricingType: "freemium" as const,
        categoryId: videoCat,
        status: "approved" as const,
        upvotes: 432,
        views: 5432,
        rating: "4.4",
        ratingCount: 198
      }
    ];

    // Add more video/audio tools
    for (let i = 3; i <= 8; i++) {
      videoAudioTools.push({
        name: `VideoAI ${i}`,
        description: `AI video and audio processing tool #${i} for content creation, editing, and enhancement.`,
        shortDescription: `AI video/audio tool #${i} for content creation`,
        url: `https://videoai${i}.com`,
        pricingType: Math.random() > 0.4 ? "freemium" as const : "paid" as const,
        categoryId: videoCat,
        status: "approved" as const,
        upvotes: Math.floor(Math.random() * 350) + 80,
        views: Math.floor(Math.random() * 4000) + 600,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        ratingCount: Math.floor(Math.random() * 200) + 50
      });
    }

    // Business & Marketing Tools (7 tools)
    const businessTools = [];
    for (let i = 1; i <= 7; i++) {
      businessTools.push({
        name: `BusinessAI ${i}`,
        description: `AI-powered business and marketing tool #${i} for automation, analytics, and customer engagement.`,
        shortDescription: `Business AI tool #${i} for marketing automation`,
        url: `https://businessai${i}.com`,
        pricingType: Math.random() > 0.3 ? "paid" as const : "freemium" as const,
        categoryId: businessCat,
        status: "approved" as const,
        upvotes: Math.floor(Math.random() * 300) + 60,
        views: Math.floor(Math.random() * 3500) + 500,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        ratingCount: Math.floor(Math.random() * 180) + 40
      });
    }

    // Education & Research Tools (5 tools)
    const eduTools = [];
    for (let i = 1; i <= 5; i++) {
      eduTools.push({
        name: `EduAI ${i}`,
        description: `AI education and research tool #${i} for learning, knowledge management, and academic research.`,
        shortDescription: `Educational AI tool #${i} for learning`,
        url: `https://eduai${i}.edu`,
        pricingType: Math.random() > 0.5 ? "freemium" as const : "paid" as const,
        categoryId: eduCat,
        status: "approved" as const,
        upvotes: Math.floor(Math.random() * 250) + 50,
        views: Math.floor(Math.random() * 2500) + 400,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        ratingCount: Math.floor(Math.random() * 150) + 30
      });
    }

    // Data & Analytics Tools (5 tools) 
    const dataTools = [];
    for (let i = 1; i <= 5; i++) {
      dataTools.push({
        name: `DataAI ${i}`,
        description: `AI data analytics and business intelligence tool #${i} for insights, reporting, and decision making.`,
        shortDescription: `Data AI tool #${i} for analytics`,
        url: `https://dataai${i}.analytics`,
        pricingType: Math.random() > 0.4 ? "paid" as const : "freemium" as const,
        categoryId: dataCat,
        status: "approved" as const,
        upvotes: Math.floor(Math.random() * 280) + 70,
        views: Math.floor(Math.random() * 3000) + 600,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        ratingCount: Math.floor(Math.random() * 160) + 40
      });
    }

    toolsData.push(...textGenTools, ...imageGenTools, ...codeTools, ...videoAudioTools, ...businessTools, ...eduTools, ...dataTools);
    const insertedTools = await db.insert(tools).values(toolsData).returning();
    console.log(`✅ Created ${insertedTools.length} tools`);

    // Create 50+ AI Models
    console.log("🤖 Creating AI models...");
    const modelsData = [];
    const modelsCat = insertedCategories.find(c => c.slug === "ai-models")?.id;

    // Language Models
    const languageModels = [
      {
        name: "GPT-4",
        description: "OpenAI's most advanced large language model with multimodal capabilities, capable of understanding and generating human-like text with high accuracy and reasoning abilities.",
        shortDescription: "OpenAI's most advanced multimodal language model",
        developer: "OpenAI",
        modelType: "language" as const,
        accessType: "api" as const,
        parameters: "1.76T",
        url: "https://openai.com/gpt-4",
        paperUrl: "https://arxiv.org/abs/2303.08774",
        demoUrl: "https://chat.openai.com",
        licenseType: "Proprietary",
        pricingDetails: "$0.03 per 1K tokens (input), $0.06 per 1K tokens (output)",
        capabilities: ["Text generation", "Code writing", "Analysis", "Multimodal understanding"],
        limitations: ["Knowledge cutoff", "No real-time data", "Token limits"],
        categoryId: modelsCat,
        status: "approved" as const,
        featured: true,
        upvotes: 1456,
        views: 18920,
        rating: "4.8",
        ratingCount: 987,
        releaseDate: new Date("2023-03-14"),
        benchmarkScores: {
          "MMLU": 86.4,
          "HellaSwag": 95.3,
          "HumanEval": 67.0
        }
      },
      {
        name: "Claude 3 Opus",
        description: "Anthropic's most powerful AI model with exceptional capabilities in analysis, creative writing, and complex reasoning tasks.",
        shortDescription: "Anthropic's most powerful AI model for complex reasoning",
        developer: "Anthropic",
        modelType: "language" as const,
        accessType: "api" as const,
        parameters: "Unknown",
        url: "https://www.anthropic.com/claude",
        demoUrl: "https://claude.ai",
        licenseType: "Proprietary",
        capabilities: ["Advanced reasoning", "Creative writing", "Code generation", "Analysis"],
        categoryId: modelsCat,
        status: "approved" as const,
        featured: true,
        upvotes: 1234,
        views: 15670,
        rating: "4.7",
        ratingCount: 743
      },
      {
        name: "Llama 2 70B",
        description: "Meta's open-source large language model with 70 billion parameters, available for commercial use with strong performance across various tasks.",
        shortDescription: "Meta's open-source 70B parameter language model",
        developer: "Meta",
        modelType: "language" as const,
        accessType: "open_source" as const,
        parameters: "70B",
        url: "https://llama.meta.com",
        paperUrl: "https://arxiv.org/abs/2307.09288",
        licenseType: "Custom Commercial License",
        capabilities: ["Text generation", "Conversation", "Code assistance"],
        categoryId: modelsCat,
        status: "approved" as const,
        featured: true,
        upvotes: 987,
        views: 12430,
        rating: "4.5",
        ratingCount: 567
      }
    ];

    // Add more language models
    for (let i = 4; i <= 25; i++) {
      modelsData.push({
        name: `LangModel-${i}`,
        description: `Advanced language model #${i} with state-of-the-art capabilities in natural language understanding and generation.`,
        shortDescription: `Language model #${i} for NLP tasks`,
        developer: `AI Corp ${i}`,
        modelType: "language" as const,
        accessType: Math.random() > 0.5 ? "api" as const : "open_source" as const,
        parameters: `${Math.floor(Math.random() * 200) + 7}B`,
        url: `https://langmodel${i}.ai`,
        capabilities: ["Text generation", "Question answering", "Summarization"],
        categoryId: modelsCat,
        status: "approved" as const,
        upvotes: Math.floor(Math.random() * 500) + 100,
        views: Math.floor(Math.random() * 8000) + 1200,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        ratingCount: Math.floor(Math.random() * 300) + 80
      });
    }

    // Image Models
    for (let i = 1; i <= 15; i++) {
      modelsData.push({
        name: `ImageModel-${i}`,
        description: `AI image generation model #${i} capable of creating high-quality images from text descriptions.`,
        shortDescription: `Image generation model #${i}`,
        developer: `Vision Labs ${i}`,
        modelType: "image" as const,
        accessType: Math.random() > 0.6 ? "api" as const : "open_source" as const,
        parameters: `${Math.floor(Math.random() * 50) + 2}B`,
        url: `https://imagemodel${i}.ai`,
        capabilities: ["Image generation", "Style transfer", "Image editing"],
        categoryId: modelsCat,
        status: "approved" as const,
        upvotes: Math.floor(Math.random() * 400) + 80,
        views: Math.floor(Math.random() * 6000) + 800,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        ratingCount: Math.floor(Math.random() * 250) + 60
      });
    }

    // Code Models
    for (let i = 1; i <= 10; i++) {
      modelsData.push({
        name: `CodeModel-${i}`,
        description: `Specialized code generation model #${i} trained on programming languages and software development tasks.`,
        shortDescription: `Code generation model #${i}`,
        developer: `Code AI ${i}`,
        modelType: "code" as const,
        accessType: Math.random() > 0.5 ? "api" as const : "open_source" as const,
        parameters: `${Math.floor(Math.random() * 100) + 6}B`,
        url: `https://codemodel${i}.dev`,
        capabilities: ["Code completion", "Bug fixing", "Code explanation"],
        categoryId: modelsCat,
        status: "approved" as const,
        upvotes: Math.floor(Math.random() * 350) + 70,
        views: Math.floor(Math.random() * 5000) + 700,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        ratingCount: Math.floor(Math.random() * 200) + 50
      });
    }

    modelsData.push(...languageModels);
    const insertedModels = await db.insert(models).values(modelsData).returning();
    console.log(`✅ Created ${insertedModels.length} models`);

    // Create 50+ Prompts
    console.log("💡 Creating prompts...");
    const promptsData = [];

    // Content creation prompts
    for (let i = 1; i <= 20; i++) {
      promptsData.push({
        title: `Content Creation Prompt ${i}`,
        description: `Professional prompt #${i} for creating engaging content across various formats and industries.`,
        content: `Create a [CONTENT_TYPE] about [TOPIC] for [AUDIENCE]. Include [SPECIFIC_REQUIREMENTS] and maintain a [TONE] tone throughout. The content should be [LENGTH] and include ${i} key points.`,
        type: "chatgpt" as const,
        categoryId: textGenCat,
        price: Math.random() > 0.6 ? "0.00" : (Math.random() * 10 + 1).toFixed(2),
        isFree: Math.random() > 0.6,
        outputExamples: [`Example output ${i}A`, `Example output ${i}B`],
        status: "approved" as const,
        featured: i <= 5,
        upvotes: Math.floor(Math.random() * 200) + 30,
        views: Math.floor(Math.random() * 1500) + 200,
        downloads: Math.floor(Math.random() * 100) + 20
      });
    }

    // Code prompts
    for (let i = 1; i <= 15; i++) {
      promptsData.push({
        title: `Code Helper Prompt ${i}`,
        description: `Advanced coding prompt #${i} for generating, debugging, and optimizing code in various programming languages.`,
        content: `Write [LANGUAGE] code to [TASK]. Include proper error handling, comments, and follow [STYLE_GUIDE] conventions. The code should be [COMPLEXITY_LEVEL] and ${i} functions.`,
        type: "chatgpt" as const,
        categoryId: codeCat,
        price: Math.random() > 0.5 ? "0.00" : (Math.random() * 15 + 2).toFixed(2),
        isFree: Math.random() > 0.5,
        outputExamples: [`Code example ${i}A`, `Code example ${i}B`],
        status: "approved" as const,
        upvotes: Math.floor(Math.random() * 180) + 40,
        views: Math.floor(Math.random() * 1200) + 150,
        downloads: Math.floor(Math.random() * 80) + 15
      });
    }

    // Business prompts
    for (let i = 1; i <= 15; i++) {
      promptsData.push({
        title: `Business Strategy Prompt ${i}`,
        description: `Professional business prompt #${i} for strategic planning, analysis, and decision-making processes.`,
        content: `Analyze [BUSINESS_SCENARIO] and provide ${i} strategic recommendations. Consider [FACTORS] and create an action plan with timelines and metrics.`,
        type: "chatgpt" as const,
        categoryId: businessCat,
        price: Math.random() > 0.4 ? (Math.random() * 20 + 5).toFixed(2) : "0.00",
        isFree: Math.random() > 0.6,
        outputExamples: [`Business analysis ${i}A`, `Strategy ${i}B`],
        status: "approved" as const,
        upvotes: Math.floor(Math.random() * 150) + 25,
        views: Math.floor(Math.random() * 1000) + 120,
        downloads: Math.floor(Math.random() * 60) + 10
      });
    }

    const insertedPrompts = await db.insert(prompts).values(promptsData).returning();
    console.log(`✅ Created ${insertedPrompts.length} prompts`);

    // Create 50+ Courses
    console.log("📚 Creating courses...");
    const coursesData = [];

    const platforms = ["Coursera", "Udemy", "edX", "Pluralsight", "LinkedIn Learning", "MasterClass", "Skillshare"];
    const skillLevels = ["beginner", "intermediate", "advanced"];

    for (let i = 1; i <= 50; i++) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const skillLevel = skillLevels[Math.floor(Math.random() * skillLevels.length)] as any;
      const categoryIds = [textGenCat, imageGenCat, codeCat, videoCat, businessCat, eduCat, dataCat];
      const categoryId = categoryIds[Math.floor(Math.random() * categoryIds.length)];

      coursesData.push({
        title: `AI Course ${i}: ${i <= 10 ? 'Foundation' : i <= 30 ? 'Practical' : 'Advanced'} Training`,
        description: `Comprehensive AI course #${i} covering essential concepts, practical applications, and real-world projects in artificial intelligence and machine learning.`,
        instructor: `Dr. AI Instructor ${i}`,
        platform,
        url: `https://${platform.toLowerCase().replace(' ', '')}.com/course/ai-${i}`,
        thumbnailUrl: `https://example.com/course-${i}.jpg`,
        price: Math.random() > 0.3 ? (Math.random() * 200 + 29).toFixed(2) : "0.00",
        duration: `${Math.floor(Math.random() * 10) + 2} weeks`,
        skillLevel,
        categoryId,
        status: "approved" as const,
        featured: i <= 8,
        upvotes: Math.floor(Math.random() * 300) + 50,
        views: Math.floor(Math.random() * 2000) + 300,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        ratingCount: Math.floor(Math.random() * 200) + 40
      });
    }

    const insertedCourses = await db.insert(courses).values(coursesData).returning();
    console.log(`✅ Created ${insertedCourses.length} courses`);

    // Create 50+ Jobs
    console.log("💼 Creating jobs...");
    const jobsData = [];

    const companies = ["TechCorp", "AI Innovations", "DataFlow", "CodeGen Inc", "Neural Networks Ltd", "DeepMind Labs", "OpenAI", "Anthropic"];
    const locations = ["San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Boston, MA", "London, UK", "Toronto, CA"];

    for (let i = 1; i <= 50; i++) {
      const company = `${companies[Math.floor(Math.random() * companies.length)]} ${i > 8 ? i : ''}`;
      const location = locations[Math.floor(Math.random() * locations.length)];
      const categoryIds = [textGenCat, imageGenCat, codeCat, businessCat, eduCat, dataCat];
      const categoryId = categoryIds[Math.floor(Math.random() * categoryIds.length)];

      jobsData.push({
        title: `${i <= 20 ? 'Senior' : i <= 35 ? 'Lead' : 'Principal'} AI ${i <= 15 ? 'Engineer' : i <= 30 ? 'Scientist' : 'Researcher'} ${i}`,
        company,
        description: `Exciting opportunity #${i} to work on cutting-edge AI projects. Join our team to develop innovative solutions using machine learning, natural language processing, and computer vision technologies.`,
        location,
        remote: Math.random() > 0.4,
        salary: `$${Math.floor(Math.random() * 100000) + 120000} - $${Math.floor(Math.random() * 150000) + 180000}`,
        applyUrl: `https://jobs.${company.toLowerCase().replace(' ', '')}.com/ai-${i}`,
        companyLogo: `https://logo.clearbit.com/${company.toLowerCase().replace(' ', '')}.com`,
        categoryId,
        status: "approved" as const,
        featured: i <= 10,
        views: Math.floor(Math.random() * 1500) + 200,
        expiresAt: new Date(Date.now() + Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000) // Random 0-60 days
      });
    }

    const insertedJobs = await db.insert(jobs).values(jobsData).returning();
    console.log(`✅ Created ${insertedJobs.length} jobs`);

    // Create 50+ Posts
    console.log("📝 Creating posts...");
    const postsData = [];

    const postTopics = [
      "Future of AI", "Machine Learning Trends", "AI Ethics", "Deep Learning", "Computer Vision",
      "Natural Language Processing", "AI in Business", "Robotics", "Quantum Computing", "AI Safety"
    ];

    for (let i = 1; i <= 50; i++) {
      const topic = postTopics[Math.floor(Math.random() * postTopics.length)];
      const categoryIds = [textGenCat, imageGenCat, codeCat, videoCat, businessCat, eduCat, dataCat];
      const categoryId = categoryIds[Math.floor(Math.random() * categoryIds.length)];

      postsData.push({
        title: `${topic} in 2024: Insights and Predictions #${i}`,
        content: `Comprehensive analysis of ${topic.toLowerCase()} trends and developments. This post explores key insights, emerging patterns, and future predictions for the AI industry. Article #${i} covers technical aspects, market implications, and practical applications across various sectors.`,
        excerpt: `Deep dive into ${topic.toLowerCase()} trends and what to expect in the coming months.`,
        coverImage: `https://example.com/post-cover-${i}.jpg`,
        slug: `${topic.toLowerCase().replace(/\s+/g, '-')}-2024-insights-${i}`,
        categoryId,
        status: "approved" as const,
        featured: i <= 12,
        upvotes: Math.floor(Math.random() * 250) + 30,
        views: Math.floor(Math.random() * 3000) + 400,
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random past 30 days
      });
    }

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

    console.log("🎉 Comprehensive database seeding completed successfully!");
    console.log("📊 Summary:");
    console.log(`  - ${insertedCategories.length} categories created`);
    console.log(`  - ${insertedTools.length} tools created`);
    console.log(`  - ${insertedModels.length} models created`);
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
      console.log("✅ Comprehensive seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Comprehensive seeding failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };