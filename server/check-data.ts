import { db } from "./db";
import { tools } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function checkData() {
  try {
    // Check for ChatGPT tool
    const chatgptTool = await db.select().from(tools).where(eq(tools.name, "ChatGPT")).limit(1);
    console.log("ChatGPT tool found:", chatgptTool.length > 0);
    if (chatgptTool.length > 0) {
      console.log("Tool ID:", chatgptTool[0].id);
      console.log("Tool name:", chatgptTool[0].name);
      console.log("Tool status:", chatgptTool[0].status);
      console.log("Tool featured:", chatgptTool[0].featured);
    }

    // Check all tools
    const allTools = await db.select().from(tools).limit(10);
    console.log("Total tools found:", allTools.length);
    console.log("Tools:", allTools.map(t => ({ id: t.id, name: t.name, status: t.status })));
    
  } catch (error) {
    console.error("Error checking data:", error);
  }
}

checkData();