-- Migration script to preserve existing tool-category relationships
-- This script creates toolCategories entries for all existing tools before removing the categoryId column

-- First, create the toolCategories table (this will be done by Drizzle push)

-- Then migrate existing data: Insert into toolCategories table for all tools that have a categoryId
INSERT INTO tool_categories (tool_id, category_id, is_primary, created_at)
SELECT 
    id as tool_id,
    category_id,
    true as is_primary, -- Mark existing categories as primary
    NOW() as created_at
FROM tools 
WHERE category_id IS NOT NULL;

-- After this migration, we can safely drop the categoryId column from tools table