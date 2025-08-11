import { db } from "./db";
import { tools } from "@shared/schema";
import { eq, desc, ilike, or } from "drizzle-orm";

async function debugSearch() {
  try {
    // Find the ChatGPT tool specifically
    console.log("=== Searching for ChatGPT tool ===");
    const chatgptTool = await db.select().from(tools).where(eq(tools.id, "521c3d6d-e4bb-413e-a42c-7df9a12e0dd3"));
    
    if (chatgptTool.length > 0) {
      console.log("ChatGPT tool found:");
      console.log(`- ID: ${chatgptTool[0].id}`);
      console.log(`- Name: "${chatgptTool[0].name}"`);
      console.log(`- Description: "${chatgptTool[0].description?.substring(0, 100)}..."`);
      console.log(`- Upvotes: ${chatgptTool[0].upvotes}`);
    } else {
      console.log("ChatGPT tool NOT found with ID 521c3d6d-e4bb-413e-a42c-7df9a12e0dd3");
    }

    // Search for tools containing "ChatGPT"
    console.log("\n=== Testing search for 'ChatGPT' ===");
    const searchResults = await db.select().from(tools).where(
      or(
        ilike(tools.name, `%ChatGPT%`),
        ilike(tools.description, `%ChatGPT%`)
      )!
    );
    console.log(`Found ${searchResults.length} tools matching 'ChatGPT'`);
    searchResults.forEach(tool => {
      console.log(`- ${tool.name} (ID: ${tool.id})`);
    });

    // Search for tools containing "chat" (case insensitive)
    console.log("\n=== Testing search for 'chat' ===");
    const chatResults = await db.select().from(tools).where(
      or(
        ilike(tools.name, `%chat%`),
        ilike(tools.description, `%chat%`)
      )!
    );
    console.log(`Found ${chatResults.length} tools matching 'chat'`);
    chatResults.forEach(tool => {
      console.log(`- ${tool.name} (ID: ${tool.id})`);
    });

    // Get top 5 tools by upvotes
    console.log("\n=== Top 5 tools by upvotes ===");
    const topTools = await db.select().from(tools).orderBy(desc(tools.upvotes)).limit(5);
    topTools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.upvotes} upvotes (ID: ${tool.id})`);
    });

  } catch (error) {
    console.error("Error in debug search:", error);
  }
}

debugSearch();