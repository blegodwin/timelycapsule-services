export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    username: string;
  };
}

export interface CreateCapsuleRequest {
  title: string;
  description?: string;
  type: 'personal' | 'group' | 'public';
  visibility?: 'private' | 'public' | 'unlisted';
  category: string;
  content: {
    text?: string;
    mediaFiles?: string[];
  };
  tags?: string[];
  unlockDate?: string;
  unlockPassword?: string;
  passwordHint?: string;
  unlockLocation?: {
    coordinates: [number, number];
    radius?: number;
    address?: string;
  };
  collaborators?: string[];
  maxCollaborators?: number;
}

export interface CapsuleQuery {
  page?: string;
  limit?: string;
  status?: 'draft' | 'sealed' | 'unlocked' | 'expired';
  type?: 'personal' | 'group' | 'public';
  visibility?: 'private' | 'public' | 'unlisted';
  category?: string;
  tags?: string;
  creator?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'unlockDate' | 'title';
  sortOrder?: 'asc' | 'desc';
}
