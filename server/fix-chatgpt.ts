import { db } from "./db";
import { tools } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

async function fixChatGPT() {
  try {
    // First check the current state
    console.log("Checking current tools ordering...");
    const topTools = await db.select().from(tools).orderBy(desc(tools.upvotes)).limit(5);
    topTools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.upvotes} upvotes, featured: ${tool.featured}`);
    });

    // Find ChatGPT
    const chatgpt = await db.select().from(tools).where(eq(tools.name, "ChatGPT")).limit(1);
    if (chatgpt.length === 0) {
      console.log("ChatGPT tool not found!");
      return;
    }

    console.log(`\nCurrent ChatGPT state: ${chatgpt[0].upvotes} upvotes, featured: ${chatgpt[0].featured}`);

    // Update ChatGPT to ensure it appears first
    await db.update(tools)
      .set({
        upvotes: 5000,
        featured: true,
        views: 95000
      })
      .where(eq(tools.name, "ChatGPT"));

    console.log("✅ Updated ChatGPT to 5000 upvotes, featured=true, 95000 views");

    // Verify the update
    const updatedChatGPT = await db.select().from(tools).where(eq(tools.name, "ChatGPT")).limit(1);
    console.log(`Verified ChatGPT: ${updatedChatGPT[0].upvotes} upvotes, featured: ${updatedChatGPT[0].featured}`);

    // Check new ordering
    console.log("\nNew tools ordering:");
    const newTopTools = await db.select().from(tools).orderBy(desc(tools.upvotes)).limit(5);
    newTopTools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.upvotes} upvotes`);
    });

  } catch (error) {
    console.error("Error fixing ChatGPT:", error);
  }
}

fixChatGPT();