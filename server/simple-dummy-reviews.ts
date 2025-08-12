import { db } from "./db";
import { reviews, reviewVotes } from "@shared/schema";
import { nanoid } from "nanoid";

async function createSimpleDummyReviews() {
  console.log("🔄 Creating simple dummy reviews...");

  const dummyReviews = [
    {
      toolId: "521c3d6d-e4bb-413e-a42c-7df9a12e0dd3", // ChatGPT
      userId: "45907898", // Current user
      title: "Excellent AI Assistant",
      content: "This tool has completely transformed my workflow. The accuracy and speed are outstanding.",
      rating: 5,
      helpful: 12,
      status: "approved"
    },
    {
      toolId: "521c3d6d-e4bb-413e-a42c-7df9a12e0dd3",
      userId: "45907898",
      title: "Good but has room for improvement",
      content: "Works well for basic tasks but sometimes struggles with complex requests. Overall satisfied.",
      rating: 4,
      helpful: 8,
      status: "approved"
    },
    {
      toolId: "521c3d6d-e4bb-413e-a42c-7df9a12e0dd3",
      userId: "45907898", 
      title: "Revolutionary technology",
      content: "This is the future of AI assistance. The capabilities are mind-blowing and it handles complex queries with ease.",
      rating: 5,
      helpful: 15,
      status: "approved"
    },
    {
      toolId: "521c3d6d-e4bb-413e-a42c-7df9a12e0dd3",
      userId: "45907898",
      title: "Decent performance overall",
      content: "Does what it promises. Not the fastest tool but reliable. Good value for money.",
      rating: 3,
      helpful: 5,
      status: "approved"
    },
    {
      toolId: "521c3d6d-e4bb-413e-a42c-7df9a12e0dd3",
      userId: "45907898",
      title: "Outstanding results for content",
      content: "Been using this for my business and the ROI is incredible. It's saved me countless hours.",
      rating: 5,
      helpful: 20,
      status: "approved"
    },
    {
      toolId: "521c3d6d-e4bb-413e-a42c-7df9a12e0dd3",
      userId: "45907898",
      title: "Perfect for beginners",
      content: "As someone new to AI tools, this was exactly what I needed. User-friendly interface.",
      rating: 4,
      helpful: 9,
      status: "approved"
    },
    {
      toolId: "521c3d6d-e4bb-413e-a42c-7df9a12e0dd3",
      userId: "45907898",
      title: "Advanced features are impressive",
      content: "The advanced features set this apart from competitors. Customization options are extensive.",
      rating: 4,
      helpful: 11,
      status: "approved"
    },
    {
      toolId: "521c3d6d-e4bb-413e-a42c-7df9a12e0dd3",
      userId: "45907898",
      title: "Game changer for productivity",
      content: "As a content creator, this tool has revolutionized my process. The quality is impressive.",
      rating: 5,
      helpful: 18,
      status: "approved"
    },
    {
      toolId: "521c3d6d-e4bb-413e-a42c-7df9a12e0dd3",
      userId: "45907898",
      title: "Solid reliable choice",
      content: "Nothing flashy but gets the job done consistently. Perfect for teams that need dependable results.",
      rating: 4,
      helpful: 10,
      status: "approved"
    },
    {
      toolId: "521c3d6d-e4bb-413e-a42c-7df9a12e0dd3",
      userId: "45907898",
      title: "Best in class performance",
      content: "After testing multiple AI tools, this one stands out. The speed, accuracy, and feature set are superior.",
      rating: 5,
      helpful: 22,
      status: "approved"
    }
  ];

  for (const review of dummyReviews) {
    const reviewId = nanoid();
    
    await db.insert(reviews).values({
      id: reviewId,
      ...review,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
      updatedAt: new Date()
    });

    // Add some review votes for realistic helpful counts
    for (let j = 0; j < review.helpful; j++) {
      try {
        await db.insert(reviewVotes).values({
          reviewId: reviewId,
          userId: "45907898",
          createdAt: new Date()
        });
      } catch (error) {
        // Skip duplicates
      }
    }
  }

  console.log(`✅ Created ${dummyReviews.length} dummy reviews for testing pagination!`);
}

createSimpleDummyReviews()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Error:", error);
    process.exit(1);
  });