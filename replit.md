# AI Community Portal

## Overview

This is a comprehensive AI community platform inspired by Toolify.ai, Futurepedia, Product Hunt, and Reddit. The platform serves as a centralized hub for AI enthusiasts to discover AI tools, news, prompts, courses, jobs, and models. It features community engagement capabilities, a prompt marketplace, personalized content recommendations, and administrative controls for content management.

The application provides both public browsing for non-authenticated users and full community features for authenticated members, including content submission, voting, bookmarking, and social interactions.

## Recent Changes (January 2025)

### Production-Scale Architecture Refactoring (January 2025)
- **Modular Feature-Based Structure**: Refactored monolithic files into focused, maintainable modules
- **Backend Modularization**: Split 1,683-line routes.ts and 2,098-line storage.ts into feature-specific services
- **Frontend Component Organization**: Restructured 3,943-line admin.tsx into manageable feature modules
- **Service Layer Architecture**: Implemented proper separation between routes, services, and data access layers
- **Dependency Injection**: Added clean dependency management for better testability and maintenance
- **Performance Optimization**: Improved development velocity and reduced bundle size through code splitting
- **Team Collaboration Ready**: Structure supports multiple developers working simultaneously without conflicts

### Enhanced Alternatives System (January 2025)
- **Database-Driven Alternatives**: Complete replacement of static alternatives with dynamic database system
- **Auto-Matching Intelligence**: Intelligent similarity scoring algorithm (40% category, 30% subcategory, 20% pricing, 10% rating)
- **Bidirectional Relationships**: Tool alternatives create automatic reciprocal relationships (A→B means B→A)
- **Admin Management Interface**: Enhanced WordPress-style alternatives tab with auto-suggestions and manual selection
- **Real-time Sync**: Frontend automatically displays admin-managed alternatives with cache invalidation
- **Scalable Architecture**: New toolAlternatives table with autoSuggested flag for performance optimization

### WordPress-Style Admin Panel Redesign (January 2025)
- **Complete Interface Restructure**: Replaced tab-based navigation with WordPress-style hierarchical sidebar navigation
- **Hierarchical Navigation**: Tools section with expandable submenu (All Tools, Add New Tool, Categories)
- **Single Comprehensive Tool Editor**: Replaced multiple edit options with unified WordPress-style edit interface
- **Professional Layout**: Dark sidebar with white content area matching WordPress admin design
- **Preserved All Functionality**: Maintained complete review management, user management, and all existing features
- **Enhanced UX**: Streamlined navigation with clear visual hierarchy and professional styling

### Complete Review Management System (Restored January 2025)
- **Admin Review Interface**: Full review management with approval/rejection workflow
- **Reported Reviews Panel**: Dedicated section for handling reported reviews with moderation actions
- **Review Status Management**: Filter by pending, approved, rejected, and reported reviews
- **Search and Filter**: Advanced search across review content, authors, and associated tools
- **Moderation Actions**: Approve, reject, keep, and remove reported reviews with proper status tracking
- **Real-time Updates**: Instant UI updates after moderation actions with proper cache invalidation

### Tool Details Page Complete Restructuring (January 2025)
- **TrustRadius-Style Layout**: Complete rewrite following professional B2B software review site structure
- **4-Column Grid System**: Clean organized layout with left navigation, main content, and right actions
- **Left Navigation Sidebar**: Professional tabbed navigation (Overview, Product Details, Comparisons, Reviews)
- **Main Content Area**: Comprehensive tool header with ratings, usage stats, and dynamic content sections
- **Right Action Sidebar**: Contact Vendor button, voting, bookmarking, and engagement features
- **Pricing Integration**: Prominent pricing display in left sidebar for better user experience
- **White Space Elimination**: Unified container structure completely resolving spacing issues
- **Professional Design**: B2B-focused layout matching industry standards for software review platforms

### Authentication Flow Optimization
- **AuthDialog Component**: Created attractive signup popup modal with Google signin prominence for maximum conversion
- **Voting/Bookmark Authentication**: Replaced bottom-right toast messages with engaging signup popup when users try to vote or bookmark without login
- **Load More Tools Pagination**: Fixed pagination functionality with proper state management for loading additional tools
- **UI Improvements**: Enhanced 3-column grid layout for better content presentation and user engagement
- **Community Stats**: Added compelling statistics (10k+ users, 500+ tools, 50k+ reviews) in AuthDialog to encourage signups
- **Google Branding**: Prominently featured Google signin with proper branding and benefits messaging

### Comprehensive Admin Panel Development (January 2025)
- **Modular Admin Interface**: Complete redesign with sidebar navigation for AI Tools, Prompts, Courses, Jobs, News, Users, Reviews, and Settings
- **Universal Content Manager**: Generic content management system that handles CRUD operations for all content types with consistent UI
- **Professional Sidebar Layout**: Sticky navigation with descriptions for each module, allowing efficient management of diverse content
- **Real-time Dashboard**: Statistics overview with total tools, users, pending reviews, and platform activity metrics
- **Advanced Search & Filtering**: Unified search and status filtering system across all content types with instant updates
- **Reviews Management System**: Comprehensive review moderation with approval workflow, reported reviews handling, and status management
- **Review Approval Workflow**: Pending, approved, and rejected review tabs with inline approval/rejection actions
- **Review Report Moderation**: Dedicated reported reviews section with Keep/Remove moderation actions and reason tracking
- **Scalable Architecture**: Modular design that can easily accommodate new content types as the platform grows
- **Error Handling**: Comprehensive error states with retry functionality and informative messages for non-implemented endpoints
- **Responsive Design**: Professional admin interface that works seamlessly on desktop and mobile devices

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: TailwindCSS with CSS custom properties for theming
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Type Safety**: TypeScript across the entire stack
- **Architecture Pattern**: Feature-based modular structure with service layers
- **API Design**: RESTful endpoints organized by domain with structured error handling
- **Service Layer**: Business logic separated from route handlers for better testability
- **Dependency Management**: Clean separation between routes, services, and data access
- **Middleware**: Custom logging, authentication, and request parsing
- **Build System**: ESBuild for production bundling

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Connection**: Neon serverless connection with WebSocket support

### Authentication System
- **Provider**: Replit Authentication with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **Security**: JWT tokens with OAuth integration (Google/GitHub)
- **User Management**: Profile system with karma scoring and social features

### File Storage Strategy
- **Cloud Storage**: Google Cloud Storage integration
- **Upload Handling**: Uppy.js for file uploads with progress tracking
- **Asset Management**: Support for images, screenshots, and user avatars

### Content Management System
The platform manages five core content types:
- **Tools**: AI software/services with ratings, categories, and user reviews
- **Prompts**: Marketplace for AI prompts with pricing and examples
- **Courses**: Educational content with skill levels and platform information
- **Jobs**: Employment listings with location and salary information
- **News/Posts**: Community-generated content with voting and comments

### Category System
- Hierarchical categorization for content organization
- Icon-based visual representation
- Tool counting and filtering capabilities
- Slug-based URL structure for SEO

### Community Features
- **Voting System**: Upvote/downvote functionality across all content types
- **Bookmarking**: Personal content saving with organized collections
- **User Profiles**: Comprehensive profiles with bio, skills, and karma scores
- **Social Feed**: Activity stream showing user interactions and achievements
- **Comments**: Threaded discussion system for all content types

### Search and Discovery
- **Search Interface**: Advanced search with filtering capabilities
- **Category Browsing**: Organized content discovery by topic
- **Trending Content**: Algorithmic content ranking based on engagement
- **Personalization**: User-specific content recommendations

### Administrative Interface
- **Content Moderation**: Admin dashboard for managing submissions
- **User Management**: Administrative controls for user accounts
- **Analytics**: Platform usage and engagement metrics
- **Content Approval**: Workflow for reviewing and approving submissions

## External Dependencies

### Authentication Services
- **Replit Auth**: Primary authentication provider with OpenID Connect
- **OAuth Providers**: Google and GitHub for social login options

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection Pooling**: Neon's built-in connection management

### File Storage
- **Google Cloud Storage**: Primary file and media storage solution
- **Uppy.js**: Frontend file upload handling with multiple plugins

### Development Tools
- **Vite**: Development server and build tool with HMR
- **Replit Integration**: Runtime error overlay and cartographer for development
- **TypeScript**: Type checking and development tooling

### UI and Styling
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **TailwindCSS**: Utility-first CSS framework with custom design system

### Form and Validation
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### State Management
- **TanStack Query**: Server state synchronization and caching
- **React Context**: Local state management for authentication and UI state