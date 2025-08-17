import { storage } from './storage';

const categoriesData = [
  {
    name: "AI Blog Writer",
    slug: "ai-blog-writer",
    description: "AI-powered tools for creating blog content and articles",
    parentCategory: "Writing & Content",
    tags: ["AI Blog Writer", "Content Automation", "Blog Content Creator", "AI-Powered Writing Tool", "Article Generator"]
  },
  {
    name: "Translate",
    slug: "translate",
    description: "AI translation and language conversion tools",
    parentCategory: "Language Tools",
    tags: ["Translation Tool", "AI Translator", "Language Converter", "AI-Powered Translation", "Multilingual Translation"]
  },
  {
    name: "Papers",
    slug: "papers",
    description: "Tools for academic and research paper writing",
    parentCategory: "Academic Tools",
    tags: ["Research Papers", "Academic Writing", "Paper Summarizer", "AI Paper Generator", "Research Assistant"]
  },
  {
    name: "Handwriting",
    slug: "handwriting",
    description: "Digital handwriting recognition and analysis tools",
    parentCategory: "Creativity Tools",
    tags: ["Handwriting Recognition", "AI Handwriting Tool", "Digital Handwriting", "Handwriting to Text"]
  },
  {
    name: "Copywriting",
    slug: "copywriting",
    description: "AI-powered copywriting and marketing content creation",
    parentCategory: "Marketing Tools",
    tags: ["Copywriting Tool", "AI Copy Generator", "Content Writing Assistant", "AI-Powered Copywriting"]
  },
  {
    name: "Captions or Subtitle",
    slug: "captions-or-subtitle",
    description: "AI tools for generating captions and subtitles",
    parentCategory: "Media Tools",
    tags: ["Caption Generator", "Subtitle Creator", "AI Captioning Tool", "Video Subtitles"]
  },
  {
    name: "Essay Writer",
    slug: "essay-writer",
    description: "AI tools for academic essay writing",
    parentCategory: "Academic Tools",
    tags: ["Essay Writer", "AI Essay Generator", "Academic Writing Tool", "Essay Creator"]
  },
  {
    name: "Letter Writer",
    slug: "letter-writer",
    description: "AI tools for writing formal and personal letters",
    parentCategory: "Writing & Content",
    tags: ["Letter Writer", "AI Letter Generator", "Formal Letter Creator", "Personal Letter Writing Tool"]
  },
  {
    name: "AI Lyrics Generator",
    slug: "ai-lyrics-generator",
    description: "AI tools for creating song lyrics and music content",
    parentCategory: "Creativity Tools",
    tags: ["AI Lyrics Generator", "Song Lyrics Creator", "Music Writing Tool", "AI-Powered Lyrics"]
  },
  {
    name: "Report Writing",
    slug: "report-writing",
    description: "AI tools for business and academic report generation",
    parentCategory: "Writing & Content",
    tags: ["Report Generator", "AI Report Writing", "Automated Report Creator", "Business Reports"]
  },
  {
    name: "AI Rewriter",
    slug: "ai-rewriter",
    description: "Tools for rewriting and paraphrasing content",
    parentCategory: "Writing & Content",
    tags: ["AI Rewriter", "Content Rephraser", "Article Rewriter", "AI Content Spinner"]
  },
  {
    name: "AI Script Writing",
    slug: "ai-script-writing",
    description: "AI tools for screenplay and script writing",
    parentCategory: "Media Tools",
    tags: ["Script Generator", "AI Script Writing", "Automated Screenwriting", "Storyboard Creator"]
  },
  {
    name: "AI Story Writing",
    slug: "ai-story-writing",
    description: "Creative AI tools for story and fiction writing",
    parentCategory: "Creativity Tools",
    tags: ["AI Story Writer", "Story Generator", "Creative Writing Tool", "AI Storytelling"]
  },
  {
    name: "AI Bio Generator",
    slug: "ai-bio-generator",
    description: "AI tools for generating personal and professional bios",
    parentCategory: "Writing & Content",
    tags: ["Bio Generator", "AI Bio Creator", "Personal Bio Writing Tool", "AI-Powered Biographies"]
  },
  {
    name: "AI Book Writing",
    slug: "ai-book-writing",
    description: "AI tools for book and novel writing",
    parentCategory: "Writing & Content",
    tags: ["Book Writing AI", "AI Book Creator", "Novel Writing Tool", "AI-Powered Book Writing"]
  },
  {
    name: "Paraphraser",
    slug: "paraphraser",
    description: "AI tools for text paraphrasing and rewriting",
    parentCategory: "Writing & Content",
    tags: ["Paraphraser", "AI Paraphrasing Tool", "Text Rewriter", "Content Paraphrasing AI"]
  },
  {
    name: "AI Poem & Poetry Generator",
    slug: "ai-poem-poetry-generator",
    description: "AI tools for creative poetry writing",
    parentCategory: "Creativity Tools",
    tags: ["AI Poem Generator", "Poetry Writing Tool", "Creative Poetry AI", "Automated Poetry Generator"]
  },
  {
    name: "Summarizer",
    slug: "summarizer",
    description: "AI tools for text summarization and content compression",
    parentCategory: "Productivity Tools",
    tags: ["Summarizer", "AI Text Summary Tool", "Automated Summarization", "Article Summarizer"]
  },
  {
    name: "Pick-up Lines Generator",
    slug: "pickup-lines-generator",
    description: "Fun AI tools for generating creative pickup lines",
    parentCategory: "Fun Tools",
    tags: ["Pick-up Lines Generator", "AI Chat-Up Lines", "Flirty Line Creator", "AI Pick-up Line Assistant"]
  },
  {
    name: "Transcription",
    slug: "transcription",
    description: "AI tools for audio and video transcription",
    parentCategory: "Media Tools",
    tags: ["Transcription Tool", "AI Transcription", "Speech-to-Text Converter", "Automated Transcribing"]
  },
  {
    name: "General Writing",
    slug: "general-writing",
    description: "General purpose AI writing tools",
    parentCategory: "Writing & Content",
    tags: ["General Writing Tool", "AI Writing Assistant", "Automated Writing", "Content Writing AI"]
  },
  {
    name: "Writing Assistants",
    slug: "writing-assistants",
    description: "AI writing assistants and productivity tools",
    parentCategory: "Productivity Tools",
    tags: ["Writing Assistants", "AI Writing Helper", "Content Writing AI", "Automated Writing Tool"]
  },
  {
    name: "AI Creative Writing",
    slug: "ai-creative-writing",
    description: "Creative AI tools for artistic writing",
    parentCategory: "Creativity Tools",
    tags: ["AI Creative Writing", "Story Generator", "Fiction Writing Tool", "Creative Writing Assistant"]
  },
  {
    name: "Transcriber",
    slug: "transcriber",
    description: "Advanced AI transcription tools",
    parentCategory: "Media Tools",
    tags: ["Transcriber", "AI Transcription", "Speech-to-Text Tool", "Automated Transcription"]
  },
  {
    name: "AI Content Generator",
    slug: "ai-content-generator",
    description: "Comprehensive AI content generation tools",
    parentCategory: "Writing & Content",
    tags: ["AI Content Generator", "Automated Content Creator", "Article Writing Tool", "Blog Content Generator"]
  },
  {
    name: "AI Email Writer",
    slug: "ai-email-writer",
    description: "AI tools for professional email writing",
    parentCategory: "Productivity Tools",
    tags: ["AI Email Writer", "Automated Email Writing", "Professional Email Generator", "Business Email AI"]
  },
  {
    name: "Novel",
    slug: "novel",
    description: "AI tools for novel and book writing",
    parentCategory: "Creativity Tools",
    tags: ["Novel Writing AI", "Book Creator", "Fiction Writing Tool", "Automated Novel Generator"]
  },
  {
    name: "Quotes Generator",
    slug: "quotes-generator",
    description: "AI tools for generating inspirational and creative quotes",
    parentCategory: "Creativity Tools",
    tags: ["Quotes Generator", "AI Quotes Creator", "Inspirational Quotes Tool", "Funny Quotes Generator"]
  },
  {
    name: "AI Product Description Generator",
    slug: "ai-product-description-generator",
    description: "AI tools for e-commerce product descriptions",
    parentCategory: "E-commerce Tools",
    tags: ["AI Product Description Generator", "Product Copywriting AI", "Automated Product Content", "E-Commerce Product Writing"]
  },
  {
    name: "Text to Image",
    slug: "text-to-image",
    description: "AI tools for generating images from text descriptions",
    parentCategory: "Design & Art",
    tags: ["Text to Image", "AI Image Generator", "Text-Based Image Creation", "Visual Content AI"]
  },
  {
    name: "AI Photo & Image Generator",
    slug: "ai-photo-image-generator",
    description: "AI tools for photo and image generation",
    parentCategory: "Design & Art",
    tags: ["AI Photo Generator", "AI Image Creator", "Automated Image Generation", "Text-to-Image AI"]
  },
  {
    name: "AI Illustration Generator",
    slug: "ai-illustration-generator",
    description: "AI tools for creating digital illustrations",
    parentCategory: "Design & Art",
    tags: ["AI Illustration Generator", "Artistic Illustration Tool", "Automated Art Creation", "AI-Powered Drawing"]
  },
  {
    name: "AI Avatar Generator",
    slug: "ai-avatar-generator",
    description: "AI tools for creating personalized avatars",
    parentCategory: "Design & Art",
    tags: ["AI Avatar Generator", "Personalized Avatar Creator", "Cartoon Avatar AI", "Character Design Tool"]
  },
  {
    name: "AI Background Generator",
    slug: "ai-background-generator",
    description: "AI tools for generating visual backgrounds",
    parentCategory: "Design & Art",
    tags: ["AI Background Generator", "Background Design Tool", "Automated Background Creator", "AI-Powered Visual Backgrounds"]
  },
  {
    name: "AI Banner Generator",
    slug: "ai-banner-generator",
    description: "AI tools for creating marketing banners",
    parentCategory: "Design & Art",
    tags: ["AI Banner Generator", "Automated Banner Design", "Marketing Banner Creator", "AI-Powered Graphics"]
  },
  {
    name: "AI Cover Generator",
    slug: "ai-cover-generator",
    description: "AI tools for book and album cover creation",
    parentCategory: "Design & Art",
    tags: ["AI Cover Generator", "Book Cover Designer", "Album Cover Creator", "AI-Powered Cover Art"]
  },
  {
    name: "AI Emoji Generator",
    slug: "ai-emoji-generator",
    description: "AI tools for creating custom emojis",
    parentCategory: "Fun Tools",
    tags: ["AI Emoji Generator", "Custom Emoji Maker", "Emoji Design Tool", "AI-Powered Emoji Creation"]
  },
  {
    name: "AI GIF Generator",
    slug: "ai-gif-generator",
    description: "AI tools for creating animated GIFs",
    parentCategory: "Media Tools",
    tags: ["AI GIF Generator", "Animated GIF Creator", "Custom GIF Maker", "AI-Powered Animation Tool"]
  },
  {
    name: "AI Icon Generator",
    slug: "ai-icon-generator",
    description: "AI tools for creating custom icons",
    parentCategory: "Design & Art",
    tags: ["AI Icon Generator", "Custom Icon Creator", "Icon Design Tool", "AI-Powered Icon Generation"]
  },
  {
    name: "AI Image Enhancer",
    slug: "ai-image-enhancer",
    description: "AI tools for enhancing image quality",
    parentCategory: "Media Tools",
    tags: ["AI Image Enhancer", "Photo Enhancement Tool", "AI-Powered Image Quality", "Automated Photo Enhancer"]
  },
  {
    name: "AI Logo Generator",
    slug: "ai-logo-generator",
    description: "AI tools for logo design and branding",
    parentCategory: "Design & Art",
    tags: ["AI Logo Generator", "Custom Logo Creator", "Automated Logo Design", "AI-Powered Branding"]
  },
  {
    name: "Photo & Image Editor",
    slug: "photo-image-editor",
    description: "AI-powered photo and image editing tools",
    parentCategory: "Design & Art",
    tags: ["Photo & Image Editor", "AI-Powered Photo Editing", "Creative Image Tool", "Automated Photo Enhancements"]
  },
  {
    name: "AI Photo Enhancer",
    slug: "ai-photo-enhancer",
    description: "AI tools for photo quality enhancement",
    parentCategory: "Media Tools",
    tags: ["AI Photo Enhancer", "Automated Photo Quality Improver", "AI-Powered Image Enhancements", "High-Resolution Image Creator"]
  },
  {
    name: "AI Photo Restoration",
    slug: "ai-photo-restoration",
    description: "AI tools for restoring old and damaged photos",
    parentCategory: "Media Tools",
    tags: ["AI Photo Restoration", "Automated Image Recovery", "AI-Powered Photo Repairs", "Vintage Photo Enhancer"]
  },
  {
    name: "AI Photography",
    slug: "ai-photography",
    description: "AI-enhanced photography tools and assistants",
    parentCategory: "Design & Art",
    tags: ["AI Photography", "Automated Photography Assistant", "AI-Powered Camera Enhancements", "Creative Photo AI"]
  },
  {
    name: "AI Profile Picture Generator",
    slug: "ai-profile-picture-generator",
    description: "AI tools for creating profile pictures",
    parentCategory: "Design & Art",
    tags: ["AI Profile Picture Generator", "Custom Profile Picture Creator", "AI-Powered Portrait Maker", "Social Media Profile AI"]
  },
  {
    name: "AI Wallpaper Generator",
    slug: "ai-wallpaper-generator",
    description: "AI tools for creating custom wallpapers",
    parentCategory: "Design & Art",
    tags: ["AI Wallpaper Generator", "Custom Wallpaper Creator", "AI-Powered Visual Backgrounds", "Text-to-Wallpaper Tool"]
  },
  {
    name: "AI Background Remover",
    slug: "ai-background-remover",
    description: "AI tools for removing backgrounds from images",
    parentCategory: "Design & Art",
    tags: ["AI Background Remover", "Automated Background Eraser", "AI-Powered Visual Editing", "Creative Background Tool"]
  },
  {
    name: "AI Manga & Comic",
    slug: "ai-manga-comic",
    description: "AI tools for creating manga and comic content",
    parentCategory: "Design & Art",
    tags: ["AI Manga & Comic", "Automated Comic Creator", "AI-Powered Manga Design", "Text-to-Manga Tool"]
  },
  {
    name: "AI Pattern Generator",
    slug: "ai-pattern-generator",
    description: "AI tools for creating visual patterns and designs",
    parentCategory: "Design & Art",
    tags: ["AI Pattern Generator", "Custom Pattern Designer", "AI-Powered Visual Patterns", "Text-to-Pattern Tool"]
  },
  {
    name: "AI Selfie & Portrait",
    slug: "ai-selfie-portrait",
    description: "AI tools for selfie and portrait enhancement",
    parentCategory: "Design & Art",
    tags: ["AI Selfie & Portrait", "Automated Portrait Enhancer", "AI-Powered Selfie Tools", "Text-to-Portrait AI"]
  },
  {
    name: "AI Tattoo Generator",
    slug: "ai-tattoo-generator",
    description: "AI tools for tattoo design generation",
    parentCategory: "Design & Art",
    tags: ["AI Tattoo Generator", "Custom Tattoo Designer", "AI-Powered Tattoo Ideas", "Creative Tattoo Tool"]
  },
  {
    name: "AI Image Scanning",
    slug: "ai-image-scanning",
    description: "AI tools for image scanning and digitization",
    parentCategory: "Media Tools",
    tags: ["AI Image Scanning", "Automated Photo Scanner", "AI-Powered Document Scanning", "Creative Image Tools"]
  },
  {
    name: "Image to Image",
    slug: "image-to-image",
    description: "AI tools for image transformation and conversion",
    parentCategory: "Design & Art",
    tags: ["Image to Image", "AI-Powered Image Transformation", "Creative Image Tools", "Text-to-Image Conversion AI"]
  }
];

export async function importCategories() {
  console.log('Starting category import...');
  
  try {
    for (const categoryData of categoriesData) {
      // Check if category already exists
      const existingCategories = await storage.getCategories();
      const exists = existingCategories.find(cat => cat.slug === categoryData.slug);
      
      if (!exists) {
        await storage.createCategory({
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          icon: '🤖', // Default icon
        });
        console.log(`Created category: ${categoryData.name}`);
      } else {
        console.log(`Category already exists: ${categoryData.name}`);
      }
    }
    
    console.log('Category import completed successfully!');
    return { success: true, imported: categoriesData.length };
  } catch (error) {
    console.error('Error importing categories:', error);
    return { success: false, error: error.message };
  }
}