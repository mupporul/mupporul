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
  planets: string[]; // Planet IDs e.g. ['sani', 'suri']
  deity: string; // Deity ID
  significance: string; // Multiline significance text
  remedies?: string[]; // Dynamic remedy & pariharam tags e.g. ['குழந்தை பாக்கியம்', 'விதி மாற்றம்']
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
  templeId?: string; // If editing an existing temple
  type: SubmissionType;
  templeData: Omit<Temple, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount'>;
  previousData?: Partial<Temple>; // If edit
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

export interface FilterState {
  planets: string[]; // multi-select planet IDs e.g. ['sani', 'suri']
  planetMatchMode: 'all' | 'exact'; // 'all': contains all selected; 'exact': exactly this set
  planet?: string | null;
  deity: string | null;
  state: string | null;
  significance: string | null;
  searchQuery: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  questionTamil: string;
  options: {
    label: string;
    labelTamil: string;
    graha: string;
    reason: string;
  }[];
}
