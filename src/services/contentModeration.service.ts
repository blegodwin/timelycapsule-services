import { Filter } from 'bad-words';
import { Configuration, OpenAIApi } from 'openai';
import { ICapsule } from '../model/capsule.model';
import { ContentFlag } from '../model/contentFlag.model';
import { Types } from 'mongoose';

class ContentModerationService {
  private filter: Filter;
  private openai: OpenAIApi;

  constructor() {
    this.filter = new Filter();
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  private async checkWithOpenAI(text: string): Promise<{ isFlagged: boolean; reason?: string; severity?: 'low' | 'medium' | 'high' }> {
    try {
      const response = await this.openai.createModeration({
        input: text,
      });

      const result = response.data.results[0];
      
      if (result.flagged) {
        const categories = result.categories;
        let severity: 'low' | 'medium' | 'high' = 'low';
        let reason = '';

        if (categories.hate || categories.violence) {
          severity = 'high';
          reason = 'Hate speech or violence detected';
        } else if (categories.sexual || categories['hate/threatening']) {
          severity = 'medium';
          reason = 'Inappropriate content detected';
        } else {
          reason = 'Potentially inappropriate content';
        }

        return { isFlagged: true, reason, severity };
      }

      return { isFlagged: false };
    } catch (error) {
      console.error('OpenAI moderation error:', error);
      return { isFlagged: false };
    }
  }

  private checkWithBadWords(text: string): string[] {
    const words = text.split(' ');
    return words.filter(word => this.filter.isProfane(word));
  }

  async moderateCapsule(capsule: ICapsule): Promise<void> {
    const textToCheck = `${capsule.title} ${capsule.message}`;
    
    // Check with bad-words library
    const profaneWords = this.checkWithBadWords(textToCheck);
    
    // Check with OpenAI
    const aiCheck = await this.checkWithOpenAI(textToCheck);

    if (profaneWords.length > 0 || aiCheck.isFlagged) {
      await ContentFlag.create({
        capsuleId: capsule._id,
        reason: aiCheck.isFlagged ? aiCheck.reason : 'Profanity detected',
        detectedContent: profaneWords,
        severity: aiCheck.severity || 'low',
      });
    }
  }

  async getFlaggedCapsules(
    status?: 'pending' | 'reviewed' | 'cleared',
    page = 1,
    limit = 10
  ) {
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    const flags = await ContentFlag.find(query)
      .populate('capsuleId')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ContentFlag.countDocuments(query);

    return {
      flags,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async reviewFlag(
    flagId: Types.ObjectId,
    reviewerId: Types.ObjectId,
    action: 'clear' | 'confirm'
  ) {
    const flag = await ContentFlag.findById(flagId);
    if (!flag) {
      throw new Error('Content flag not found');
    }

    flag.status = action === 'clear' ? 'cleared' : 'reviewed';
    flag.reviewedBy = reviewerId;
    flag.reviewedAt = new Date();
    await flag.save();

    return flag;
  }
}

export const contentModerationService = new ContentModerationService();
