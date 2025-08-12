import { db } from "./db";
import { tools, reviews, reviewVotes } from "@shared/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

async function createDummyReviews() {
  console.log("🔄 Creating comprehensive dummy reviews for pagination testing...");

  try {
    // Get all tools to add reviews to
    const allTools = await db.select().from(tools);
    
    if (allTools.length === 0) {
      console.log("❌ No tools found. Please run the seeder first.");
      return;
    }

    // Get existing users from the database
    const { users } = await import("@shared/schema");
    const existingUsers = await db.select({ id: users.id }).from(users);
    
    if (existingUsers.length === 0) {
      console.log("❌ No users found in database. Creating some dummy users first...");
      // Create some dummy users for reviews
      const dummyUsers = [
        { id: "reviewer1", email: "reviewer1@example.com", firstName: "John", lastName: "Smith" },
        { id: "reviewer2", email: "reviewer2@example.com", firstName: "Sarah", lastName: "Johnson" },
        { id: "reviewer3", email: "reviewer3@example.com", firstName: "Mike", lastName: "Wilson" },
        { id: "reviewer4", email: "reviewer4@example.com", firstName: "Emma", lastName: "Brown" },
        { id: "reviewer5", email: "reviewer5@example.com", firstName: "Alex", lastName: "Davis" },
      ];
      
      for (const user of dummyUsers) {
        await db.insert(users).values(user);
        existingUsers.push({ id: user.id });
      }
    }

    console.log(`📊 Found ${allTools.length} tools and ${existingUsers.length} users. Creating reviews...`);

    const sampleReviews = [
      {
        title: "Excellent AI Assistant",
        content: "This tool has completely transformed my workflow. The accuracy and speed are outstanding. I've been using it for 6 months now and it consistently delivers high-quality results. Highly recommended for anyone looking to improve their productivity.",
        rating: 5,
        helpful: 12
      },
      {
        title: "Good but has limitations",
        content: "Works well for basic tasks but struggles with more complex requests. The interface is intuitive and the results are generally good. Could benefit from better context understanding and more advanced features.",
        rating: 4,
        helpful: 8
      },
      {
        title: "Revolutionary technology",
        content: "This is the future of AI assistance. The capabilities are mind-blowing and it handles complex queries with ease. I've tried many AI tools, but this one stands out. The learning curve is minimal and the results are exceptional.",
        rating: 5,
        helpful: 15
      },
      {
        title: "Decent performance",
        content: "Does what it promises. Not the fastest tool I've used, but reliable. The pricing is reasonable and customer support is responsive. Good value for money overall.",
        rating: 3,
        helpful: 5
      },
      {
        title: "Outstanding results",
        content: "Been using this for my business and the ROI is incredible. It's saved me countless hours and the quality of output is professional-grade. Integration was smooth and the documentation is comprehensive.",
        rating: 5,
        helpful: 20
      },
      {
        title: "Room for improvement",
        content: "The tool has potential but needs work. Sometimes gives inconsistent results and the UI could be more polished. Customer service is helpful though and they seem to be actively improving the platform.",
        rating: 3,
        helpful: 4
      },
      {
        title: "Perfect for beginners",
        content: "As someone new to AI tools, this was exactly what I needed. The tutorial was helpful and the interface is user-friendly. Results are good and it's helped me learn a lot about AI capabilities.",
        rating: 4,
        helpful: 9
      },
      {
        title: "Advanced features impressive",
        content: "The advanced features set this apart from competitors. Customization options are extensive and the API integration is seamless. Technical documentation could be better but overall very satisfied.",
        rating: 4,
        helpful: 11
      },
      {
        title: "Not what I expected",
        content: "Marketing promises didn't match reality. The tool works but not as advertised. Performance is average and some features are missing. Might be worth trying but manage your expectations.",
        rating: 2,
        helpful: 3
      },
      {
        title: "Incredible value proposition",
        content: "For the price point, this is unbeatable. Yes, there are more advanced tools available, but for small businesses like mine, this hits the sweet spot of functionality and affordability.",
        rating: 4,
        helpful: 7
      },
      {
        title: "Game changer for content creation",
        content: "As a content creator, this tool has revolutionized my process. The quality of generated content is impressive and it saves me hours of work. The templates are well-designed and customizable.",
        rating: 5,
        helpful: 18
      },
      {
        title: "Technical issues need addressing",
        content: "Great concept but plagued with bugs. Had several crashes during important projects. Support team is working on fixes but it's affecting my productivity. Will update review once issues are resolved.",
        rating: 2,
        helpful: 6
      },
      {
        title: "Solid reliable choice",
        content: "Nothing flashy but gets the job done consistently. I appreciate the reliability and straightforward approach. Perfect for teams that need dependable results without unnecessary complexity.",
        rating: 4,
        helpful: 10
      },
      {
        title: "Exceeded my expectations",
        content: "Came in with low expectations but was pleasantly surprised. The AI understanding is remarkably good and it handles edge cases well. The development team is responsive to feedback.",
        rating: 5,
        helpful: 14
      },
      {
        title: "Best in class performance",
        content: "After testing 12 different AI tools, this one stands out. The speed, accuracy, and feature set are superior. Integration with existing workflows was seamless. Worth every penny.",
        rating: 5,
        helpful: 22
      },
      {
        title: "Mixed experience",
        content: "Some features work brilliantly while others feel half-baked. The core functionality is solid but auxiliary features need work. Regular updates show the team is committed to improvement.",
        rating: 3,
        helpful: 5
      },
      {
        title: "Perfect for enterprise use",
        content: "Deployed this across our organization and the results have been fantastic. Security features are robust, scaling worked smoothly, and employee adoption was quick. Excellent enterprise solution.",
        rating: 5,
        helpful: 16
      },
      {
        title: "Learning curve is steep",
        content: "Powerful tool but requires significant time investment to master. Documentation helps but more tutorials would be beneficial. Once you get the hang of it, results are impressive.",
        rating: 3,
        helpful: 8
      },
      {
        title: "Innovation at its finest",
        content: "This represents the cutting edge of AI technology. Features I didn't even know I needed. The research team behind this is clearly world-class. Excited to see future developments.",
        rating: 5,
        helpful: 19
      },
      {
        title: "Good starter option",
        content: "If you're just getting into AI tools, this is a safe choice. Not the most advanced but covers all the basics well. Pricing is fair and there's room to grow with the platform.",
        rating: 4,
        helpful: 6
      }
    ];

    const userIds = existingUsers.map(u => u.id);

    let reviewCount = 0;

    // Create reviews for each tool
    for (const tool of allTools) {
      // Create 8-15 reviews per tool for good pagination testing
      const numReviews = Math.floor(Math.random() * 8) + 8; // 8-15 reviews
      
      for (let i = 0; i < numReviews; i++) {
        const sampleReview = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        
        const reviewId = nanoid();
        
        const [newReview] = await db.insert(reviews).values({
          id: reviewId,
          toolId: tool.id,
          userId: userId,
          title: sampleReview.title,
          content: sampleReview.content,
          rating: sampleReview.rating,
          helpful: sampleReview.helpful,
          status: "approved",
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // Random date within last 30 days
          updatedAt: new Date()
        }).returning();

        // Add some review votes for realistic helpful counts
        const numVotes = sampleReview.helpful;
        for (let j = 0; j < numVotes; j++) {
          const voterUserId = userIds[Math.floor(Math.random() * userIds.length)];
          try {
            await db.insert(reviewVotes).values({
              reviewId: reviewId,
              userId: voterUserId,
              createdAt: new Date()
            });
          } catch (error) {
            // Skip if user already voted (unique constraint)
          }
        }

        reviewCount++;
      }
    }

    // Create some reported reviews for admin testing by updating review fields
    console.log("🚨 Creating reported reviews for admin testing...");
    
    // Get some recent reviews to report
    const recentReviews = await db.select().from(reviews).limit(5);
    
    const reportReasons = ['spam', 'inappropriate', 'fake', 'harassment', 'other'];
    
    for (const review of recentReviews.slice(0, 3)) {
      const reportReason = reportReasons[Math.floor(Math.random() * reportReasons.length)];
      
      await db.update(reviews)
        .set({
          reported: true,
          reportReason: reportReason,
          updatedAt: new Date()
        })
        .where(eq(reviews.id, review.id));
    }

    console.log(`✅ Successfully created ${reviewCount} dummy reviews and 3 reported reviews!`);
    console.log("📊 Reviews are distributed across all tools for comprehensive pagination testing");
    console.log("🎯 Each tool now has 8-15 reviews with realistic helpful vote counts");
    console.log("🚨 3 reviews have been reported and are available in admin panel");

  } catch (error) {
    console.error("❌ Error creating dummy reviews:", error);
    throw error;
  }
}

// Run the script
createDummyReviews()
  .then(() => {
    console.log("🎉 Dummy review creation completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed to create dummy reviews:", error);
    process.exit(1);
  });