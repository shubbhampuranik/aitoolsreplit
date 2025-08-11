import { db } from "./db";
import { tools, users } from "@shared/schema";
import { eq } from "drizzle-orm";

// This script enriches one tool (ChatGPT) with comprehensive dummy data for testing
export async function enrichToolData() {
  try {
    // Find ChatGPT tool
    const chatGPTTool = await db
      .select()
      .from(tools)
      .where(eq(tools.name, "ChatGPT"))
      .limit(1);

    if (chatGPTTool.length === 0) {
      console.log("ChatGPT tool not found");
      return;
    }

    const toolId = chatGPTTool[0].id;

    // Update the tool with comprehensive data
    await db
      .update(tools)
      .set({
        description: `ChatGPT is a state-of-the-art conversational AI developed by OpenAI, powered by the GPT-4 architecture. It excels at understanding and generating human-like text for a wide variety of applications including writing assistance, code generation, analysis, creative tasks, and problem-solving.

Key capabilities include:
• Advanced natural language understanding and generation
• Multi-turn conversations with excellent context retention
• Code generation and debugging across multiple programming languages
• Creative writing, editing, and content creation
• Complex reasoning and analytical tasks
• Mathematical problem solving and explanations
• Research assistance and information synthesis

ChatGPT has revolutionized how people interact with AI, making advanced language capabilities accessible to millions of users worldwide. Whether you're a student, professional, developer, or creative, ChatGPT can adapt to your specific needs and communication style.

The model is continuously improved through reinforcement learning from human feedback (RLHF), ensuring responses are helpful, accurate, and aligned with human values. With both free and premium tiers available, ChatGPT offers flexible access to cutting-edge AI technology.`,
        shortDescription: "Advanced conversational AI assistant by OpenAI for writing, coding, analysis, and creative tasks",
        gallery: [
          "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1676299081847-824916de030a?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1676266664223-5f146cfeb59a?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1676573409628-8b8d37b83b56?w=800&h=600&fit=crop"
        ],
        pricingDetails: "Free tier: $0/month with usage limits | ChatGPT Plus: $20/month with GPT-4 access and priority | ChatGPT Team: $25/user/month for teams | ChatGPT Enterprise: Custom pricing for large organizations",
        socialLinks: {
          website: "https://openai.com",
          twitter: "https://twitter.com/OpenAI",
          linkedin: "https://www.linkedin.com/company/openai",
          github: "https://github.com/openai"
        },
        prosAndCons: {
          pros: [
            "Highly accurate and contextually aware responses",
            "Excellent for creative writing and content generation", 
            "Strong code generation and debugging capabilities",
            "Maintains context across long conversations",
            "Constantly improving through user feedback",
            "User-friendly interface accessible to everyone",
            "Supports multiple languages and writing styles",
            "Great for research and analysis tasks"
          ],
          cons: [
            "Requires subscription for latest GPT-4 model access",
            "Knowledge cutoff means limited recent information",
            "Can occasionally generate plausible but incorrect information",
            "Usage limits on free tier can be restrictive",
            "May struggle with very specific or niche topics",
            "Response time can vary during peak usage periods"
          ]
        },
        faqs: [
          {
            question: "What's the difference between ChatGPT Free and ChatGPT Plus?",
            answer: "ChatGPT Free provides access to GPT-3.5 with usage limitations, while ChatGPT Plus ($20/month) offers access to GPT-4, priority access during peak times, faster response speeds, and early access to new features."
          },
          {
            question: "Can ChatGPT help with coding and programming?",
            answer: "Yes! ChatGPT is excellent for coding assistance. It can help with code generation, debugging, code review, explaining complex algorithms, converting between programming languages, and providing coding best practices across dozens of programming languages."
          },
          {
            question: "Is my data safe and private when using ChatGPT?",
            answer: "OpenAI takes privacy seriously. Conversations may be used to improve the model unless you opt out. ChatGPT Plus and Team users can opt out of data usage for training. Enterprise users have additional privacy controls and data is not used for training."
          },
          {
            question: "What are the usage limits for ChatGPT?",
            answer: "Free users have message limits that reset every 3 hours. ChatGPT Plus users get priority access and higher usage limits. Exact limits may vary based on demand and are adjusted to ensure fair access for all users."
          },
          {
            question: "Can ChatGPT access the internet or browse websites?",
            answer: "ChatGPT Plus users have access to web browsing capabilities through plugins, allowing real-time web searches and accessing current information. Free users are limited to the model's training data with a knowledge cutoff."
          }
        ],
        tags: [
          { name: "AI Assistant", slug: "ai-assistant" },
          { name: "Text Generation", slug: "text-generation" },
          { name: "Code Helper", slug: "code-helper" },
          { name: "Writing", slug: "writing" },
          { name: "OpenAI", slug: "openai" },
          { name: "GPT-4", slug: "gpt-4" },
          { name: "Conversational AI", slug: "conversational-ai" },
          { name: "Natural Language", slug: "natural-language" }
        ],
        upvotes: 2547,
        views: 89234,
        rating: "4.8",
        ratingCount: 1843
      })
      .where(eq(tools.id, toolId));

    console.log(`✅ Successfully enriched ChatGPT tool with comprehensive data`);
  } catch (error) {
    console.error("Error enriching tool data:", error);
  }
}

// Auto-run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  enrichToolData();
}