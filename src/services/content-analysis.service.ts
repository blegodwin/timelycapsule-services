import { Types } from 'mongoose';
import { Capsule } from '../model/capsule.model';

interface ContentAnalysisResult {
  toxicityScore: number;
  categories: string[];
  recommendedAction: string;
  confidence: number;
}

// Simple text analysis based on keywords
function analyzeText(text: string): ContentAnalysisResult {
  const result: ContentAnalysisResult = {
    toxicityScore: 0,
    categories: [],
    recommendedAction: 'review',
    confidence: 0.5
  };

  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();

  // Define category patterns
  const patterns = {
    harassment: [
      'harass', 'bully', 'threaten', 'stalk', 'intimidate'
    ],
    hate_speech: [
      'hate', 'racist', 'discrimination', 'bigot', 'slur'
    ],
    inappropriate_content: [
      'explicit', 'nude', 'nsfw', 'inappropriate', 'offensive'
    ],
    spam: [
      'spam', 'advertis', 'promotion', 'scam', 'phish'
    ],
    violence: [
      'violence', 'threat', 'kill', 'attack', 'weapon'
    ],
    copyright: [
      'copyright', 'stolen', 'plagiari', 'intellectual property', 'trademark'
    ]
  };

  // Check each category
  let totalMatches = 0;
  const categoryMatches = new Map<string, number>();

  for (const [category, keywords] of Object.entries(patterns)) {
    const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (matches > 0) {
      categoryMatches.set(category, matches);
      totalMatches += matches;
      result.categories.push(category);
    }
  }

  // Calculate toxicity score (0-1)
  if (totalMatches > 0) {
    result.toxicityScore = Math.min(totalMatches / 5, 1);
    
    // Adjust confidence based on number of matches
    result.confidence = Math.min(0.3 + (totalMatches / 10), 0.9);

    // Set priority based on toxicity score
    if (result.toxicityScore >= 0.8) {
      result.recommendedAction = 'urgent_review';
    } else if (result.toxicityScore >= 0.5) {
      result.recommendedAction = 'priority_review';
    }
  }

  return result;
}

export async function analyzeCapsuleContent(capsuleId: Types.ObjectId): Promise<ContentAnalysisResult> {
  try {
    // Get capsule content
    const capsule = await Capsule.findById(capsuleId);
    if (!capsule) {
      throw new Error('Capsule not found');
    }

    // Analyze text content
    const textAnalysis = analyzeText(capsule.message);

    // For now, we're just analyzing text
    // TODO: Add media content analysis if needed

    return textAnalysis;
  } catch (error) {
    console.error('Error analyzing capsule content:', error);
    return {
      toxicityScore: 0,
      categories: [],
      recommendedAction: 'manual_review',
      confidence: 0
    };
  }
}
