import { db } from "./db";
import { tools } from "@shared/schema";
import { eq } from "drizzle-orm";

async function checkChatGPTStatus() {
  try {
    const chatgpt = await db.select().from(tools).where(eq(tools.id, "521c3d6d-e4bb-413e-a42c-7df9a12e0dd3"));
    
    if (chatgpt.length > 0) {
      console.log("ChatGPT tool status:");
      console.log(`- Status: "${chatgpt[0].status}"`);
      console.log(`- Name: "${chatgpt[0].name}"`);
      console.log(`- Featured: ${chatgpt[0].featured}`);
      
      // Update status to approved if it's not
      if (chatgpt[0].status !== "approved") {
        await db.update(tools)
          .set({ status: "approved" })
          .where(eq(tools.id, "521c3d6d-e4bb-413e-a42c-7df9a12e0dd3"));
        console.log("✅ Updated ChatGPT status to 'approved'");
      }
    } else {
      console.log("ChatGPT tool not found");
    }
  } catch (error) {
    console.error("Error checking ChatGPT status:", error);
  }
}

checkChatGPTStatus();