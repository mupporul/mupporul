export type Role = 'user' | 'contributor' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  role: Role;
  avatarText: string;
  avatarColor: string;
  contributionsCount: number;
  approvedCount: number;
  createdAt?: string;
}

export interface Planet {
  id: string;
  nameTamil: string;
  nameEnglish: string;
  grahaLord: string;
  color: string;
  day: string;
  gemstone: string;
}

export interface Deity {
  id: string;
  nameTamil: string;
  nameEnglish: string;
}

export interface Temple {
  id: string;
  name: string;
  nameTamil?: string;
  location: string;
  state: string;
  district?: string;
  planets: string[];
  deity: string;
  significance: string;
  remedies?: string[];
  descriptionTamil?: string;
  descriptionEnglish?: string;
  imageUrl: string;
  videoUrl: string;
  pariharamInfo?: string;
  timings: string;
  history?: string;
  poojaDetails?: string;
  contactNumber?: string;
  coordinates?: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
  submittedBy?: {
    id: string;
    name: string;
    role: Role;
  };
  viewsCount: number;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';
export type SubmissionType = 'new' | 'edit';

export interface TempleSubmission {
  id: string;
  templeId?: string;
  type: SubmissionType;
  templeData: Omit<Temple, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount'>;
  previousData?: Partial<Temple>;
  submittedBy: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  submittedAt: string;
  status: SubmissionStatus;
  reviewedBy?: {
    id: string;
    name: string;
    role: Role;
  };
  reviewedAt?: string;
  reviewNotes?: string;
}
