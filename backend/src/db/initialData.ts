import { Temple, TempleSubmission, UserProfile, Planet, Deity } from '../types.js';

export const INITIAL_PLANETS: Planet[] = [
  { id: 'suri', nameTamil: 'சூரி', nameEnglish: 'Surya (Sun)', grahaLord: 'சூரிய பகவான்', color: '#f59e0b', day: 'ஞாயிறு (Sunday)', gemstone: 'மாணிக்கம் (Ruby)' },
  { id: 'sani', nameTamil: 'சனி', nameEnglish: 'Shani (Saturn)', grahaLord: 'சனீஸ்வரர்', color: '#3b82f6', day: 'சனி (Saturday)', gemstone: 'நீலக்கல் (Blue Sapphire)' },
  { id: 'rahu', nameTamil: 'ராகு', nameEnglish: 'Rahu (North Node)', grahaLord: 'ராகு பகவான்', color: '#8b5cf6', day: 'செவ்வாய் / வெள்ளி', gemstone: 'கோமேதகம் (Hessonite)' },
  { id: 'kethu', nameTamil: 'கேது', nameEnglish: 'Ketu (South Node)', grahaLord: 'கேது பகவான்', color: '#ec4899', day: 'வியாழன் / ஞாயிறு', gemstone: 'வைடூரியம் (Cat\'s Eye)' },
  { id: 'sev', nameTamil: 'செவ்', nameEnglish: 'Chevvai (Mars)', grahaLord: 'அங்காரகன்', color: '#ef4444', day: 'செவ்வாய் (Tuesday)', gemstone: 'பவளம் (Coral)' },
  { id: 'suk', nameTamil: 'சுக்', nameEnglish: 'Sukran (Venus)', grahaLord: 'சுக்கிரன்', color: '#10b981', day: 'வெள்ளி (Friday)', gemstone: 'வைரம் (Diamond)' },
  { id: 'guru', nameTamil: 'குரு', nameEnglish: 'Guru (Jupiter)', grahaLord: 'குரு பகவான்', color: '#eab308', day: 'வியாழன் (Thursday)', gemstone: 'புஷ்பராகம் (Yellow Sapphire)' },
  { id: 'san', nameTamil: 'சந்', nameEnglish: 'Chandra (Moon)', grahaLord: 'சந்திர பகவான்', color: '#94a3b8', day: 'திங்கள் (Monday)', gemstone: 'முத்து (Pearl)' },
  { id: 'puth', nameTamil: 'புத', nameEnglish: 'Budha (Mercury)', grahaLord: 'புதன் பகவான்', color: '#06b6d4', day: 'புதன் (Wednesday)', gemstone: 'மரகதம் (Emerald)' },
];

export const INITIAL_DEITIES: Deity[] = [
  { id: 'amman', nameTamil: 'அம்மன்', nameEnglish: 'Amman / Devi' },
  { id: 'shivan', nameTamil: 'சிவன்', nameEnglish: 'Shiva' },
  { id: 'vishnu', nameTamil: 'விஷ்ணு', nameEnglish: 'Vishnu / Perumal' },
  { id: 'murugan', nameTamil: 'முருகன்', nameEnglish: 'Murugan / Karthikeya' },
  { id: 'ayyappan', nameTamil: 'ஐயப்பன்', nameEnglish: 'Ayyappan' },
  { id: 'pillaiyar', nameTamil: 'பிள்ளையார்', nameEnglish: 'Pillaiyar / Ganesha' },
  { id: 'bhairavar', nameTamil: 'பைரவர்', nameEnglish: 'Bhairavar' },
  { id: 'anjaneyar', nameTamil: 'ஆஞ்சநேயர்', nameEnglish: 'Anjaneyar / Hanuman' },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-admin',
    name: 'Admin Murugan',
    username: 'admin',
    email: 'admin@mupporul.app',
    password: 'admin123',
    role: 'admin',
    avatarText: 'AM',
    avatarColor: '#e53e3e',
    contributionsCount: 1,
    approvedCount: 0
  }
];

// Zero hardcoded dummy temples - dynamically populated from Supabase / database
export const INITIAL_TEMPLES: Temple[] = [];

export const INITIAL_SUBMISSIONS: TempleSubmission[] = [];
