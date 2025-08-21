// Shared utility functions
export const generateId = () => {
  return crypto.randomUUID();
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const calculateSimilarityScore = (
  tool1: any,
  tool2: any
): number => {
  let score = 0;

  // Category similarity (40%)
  if (tool1.categoryId === tool2.categoryId) {
    score += 0.4;
  }

  // Pricing type similarity (20%)
  if (tool1.pricingType === tool2.pricingType) {
    score += 0.2;
  }

  // Rating similarity (10%)
  const ratingDiff = Math.abs((tool1.rating || 0) - (tool2.rating || 0));
  if (ratingDiff <= 1) {
    score += 0.1;
  }

  // Name/description similarity (30%)
  const combinedText1 = `${tool1.name} ${tool1.shortDescription}`.toLowerCase();
  const combinedText2 = `${tool2.name} ${tool2.shortDescription}`.toLowerCase();
  
  const words1 = combinedText1.split(/\s+/);
  const words2 = combinedText2.split(/\s+/);
  
  const commonWords = words1.filter(word => 
    words2.includes(word) && word.length > 3
  );
  
  if (commonWords.length > 0) {
    score += Math.min(0.3, (commonWords.length / Math.max(words1.length, words2.length)) * 0.3);
  }

  return Math.round(score * 100) / 100;
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const paginate = <T>(
  items: T[],
  page: number = 1,
  limit: number = 20
): { items: T[]; total: number; pages: number; currentPage: number } => {
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);
  
  return {
    items: paginatedItems,
    total: items.length,
    pages: Math.ceil(items.length / limit),
    currentPage: page
  };
};

export const normalizeUrl = (url: string): string => {
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};