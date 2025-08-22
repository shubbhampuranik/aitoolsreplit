#!/bin/bash
# Next.js Migration Setup Script for AI Community Portal

echo "🚀 Starting Next.js Migration for AI Community Portal..."

# Step 1: Create Next.js project
echo "📦 Creating Next.js project..."
npx create-next-app@latest nextjs-ai-community \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git

cd nextjs-ai-community

# Step 2: Install required dependencies
echo "📚 Installing dependencies..."
npm install \
  @tanstack/react-query \
  @tanstack/react-table \
  @hookform/resolvers \
  drizzle-orm \
  drizzle-kit \
  @neondatabase/serverless \
  wouter \
  zod \
  zod-validation-error \
  react-hook-form \
  lucide-react \
  next-auth \
  @auth/drizzle-adapter

# Step 3: Install UI dependencies (Shadcn/ui)
echo "🎨 Installing UI components..."
npx shadcn-ui@latest init --yes
npx shadcn-ui@latest add button card badge separator dialog select textarea input label toast

# Step 4: Create directory structure
echo "📁 Creating directory structure..."
mkdir -p src/lib src/components/ui src/app/tools/[id] src/app/api/tools
mkdir -p src/app/admin src/app/prompts src/app/courses src/app/jobs src/app/news
mkdir -p shared server

# Step 5: Copy existing schemas and utilities
echo "📋 Copying existing code..."
if [ -d "../shared" ]; then
  cp -r ../shared/* ./shared/
fi

if [ -d "../server" ]; then
  cp -r ../server/db.ts ../server/storage.ts ../server/aiToolAnalyzer.ts ./server/
fi

# Step 6: Create basic configuration files
echo "⚙️  Creating configuration files..."

# Create next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'via.placeholder.com',
      'images.unsplash.com',
      'cdn.openai.com',
      'storage.googleapis.com'
    ],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  }
}

module.exports = nextConfig
EOF

# Create environment template
cat > .env.local.template << 'EOF'
# Database
DATABASE_URL=your_database_url_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Replit Auth (if migrating)
REPL_ID=your_repl_id_here
EOF

echo "✅ Next.js project setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. cd nextjs-ai-community"
echo "2. Copy your .env file: cp ../.env .env.local"
echo "3. Start development: npm run dev"
echo "4. Visit http://localhost:3000"
echo ""
echo "📖 See NEXTJS_MIGRATION_PLAN.md for detailed migration steps"