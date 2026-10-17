import { Planet, Deity, UserProfile, QuizQuestion } from '../types';

export const PLANETS: Planet[] = [
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

export const DEITIES: Deity[] = [
  { id: 'amman', nameTamil: 'அம்மன்', nameEnglish: 'Amman / Devi' },
  { id: 'shivan', nameTamil: 'சிவன்', nameEnglish: 'Shiva' },
  { id: 'vishnu', nameTamil: 'விஷ்ணு', nameEnglish: 'Vishnu / Perumal' },
  { id: 'murugan', nameTamil: 'முருகன்', nameEnglish: 'Murugan / Karthikeya' },
  { id: 'ayyappan', nameTamil: 'ஐயப்பன்', nameEnglish: 'Ayyappan' },
  { id: 'pillaiyar', nameTamil: 'பிள்ளையார்', nameEnglish: 'Pillaiyar / Ganesha' },
  { id: 'bhairavar', nameTamil: 'பைரவர்', nameEnglish: 'Bhairavar' },
  { id: 'anjaneyar', nameTamil: 'ஆஞ்சநேயர்', nameEnglish: 'Anjaneyar / Hanuman' },
];

export const STATES = [
  'Tamil Nadu',
  'Puducherry',
  'Kerala',
  'Karnataka',
  'Andhra Pradesh',
];

export const STATES_AND_DISTRICTS = [
  { state: 'Tamil Nadu', districts: [] },
  { state: 'Puducherry', districts: [] },
  { state: 'Kerala', districts: [] },
  { state: 'Karnataka', districts: [] },
  { state: 'Andhra Pradesh', districts: [] },
];

export const SIGNIFICANCE_OPTIONS = [
  { id: 'navagraha_dosha', label: 'Navagraha Dosha Nivarana (நவக்கிரக தோஷ நிவர்த்தி)' },
  { id: 'career_job', label: 'Career & Employment Growth (வேலைவாய்ப்பு & தொழில் முன்னேற்றம்)' },
  { id: 'marriage', label: 'Marriage Obstacles Removal (திருமண தடை நீங்குதல்)' },
  { id: 'health_healing', label: 'Health, Diseases & Longevity (தீராத பிணிகள் குணமாக & ஆயுள்)' },
  { id: 'rahu_ketu_sarpa', label: 'Rahu-Ketu / Sarpa Dosha (நாக தோஷம் & ராகு கேது பரிகாரம்)' },
  { id: 'debt_enemies', label: 'Relief from Debts & Enemies (கடன் சுமை & எதிரிகள் பயம் தீர)' },
  { id: 'child_boon', label: 'Child Boon / Santhana Gopalan (மழலைச் செல்வம் பெற)' },
  { id: 'education_wisdom', label: 'Wisdom & Education (கல்வி & ஞானம் பெற)' },
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
    avatarColor: 'from-purple-600 to-indigo-800',
    contributionsCount: 15,
    approvedCount: 15,
  },
  {
    id: 'user-vk',
    name: 'Vasanth Kumar (VK)',
    username: 'vk',
    email: 'vk@mupporul.app',
    password: 'contributor123',
    role: 'contributor',
    avatarText: 'VK',
    avatarColor: 'from-amber-500 to-amber-700',
    contributionsCount: 8,
    approvedCount: 7,
  },
  {
    id: 'user-devotee',
    name: 'Devotee Anbar',
    username: 'devotee',
    email: 'devotee@mupporul.app',
    password: 'user123',
    role: 'user',
    avatarText: 'DA',
    avatarColor: 'from-emerald-500 to-teal-700',
    contributionsCount: 0,
    approvedCount: 0,
  },
];

export const SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'What is the primary spiritual or life obstacle you seek relief from?',
    questionTamil: 'நீங்கள் பரிகாரம் அல்லது அருள் பெற விரும்பும் முக்கிய விஷயம் என்ன?',
    options: [
      { label: 'Job delay, career setbacks, or Sade Sati hardships', labelTamil: 'வேலைவாய்ப்பு தாமதம், சனி நீச்சம், ஏழரை சனி பாதிப்புகள்', graha: 'sani', reason: 'Lord Shani regulates profession, discipline, and karmic delays.' },
      { label: 'Marriage delay, relationship discord, or Sevvai dosham', labelTamil: 'திருமண தடை, செவ்வாய் தோஷம், குடும்ப ஒற்றுமை', graha: 'sev', reason: 'Mars (Chevvai) and Venus (Sukran) govern marital harmony.' },
      { label: 'Sudden unexpected confusion, illusions, or Naga dosham', labelTamil: 'நாக தோஷம், திடீர் குழப்பங்கள், ராகு கேது மகாதிசை', graha: 'rahu', reason: 'Rahu & Ketu cause unexplained transitions and shadowy obstacles.' },
      { label: 'Mental peace, stress relief, and health tranquility', labelTamil: 'மன அமைதி, நிம்மதி, ஆரோக்கிய மேன்மை', graha: 'san', reason: 'Chandra rules mind (Manokaraka) and psychological peace.' }
    ]
  },
  {
    id: 2,
    question: 'Which divine deity do you feel naturally drawn to for prayers?',
    questionTamil: 'நீங்கள் மனதார அதிகம் வணங்கும் இஷ்ட தெய்வம் எது?',
    options: [
      { label: 'Shakthi / Angalamman / Durga', labelTamil: 'அம்மன் / அங்காளபரமேஸ்வரி / காளி', graha: 'rahu', reason: 'Goddess Angalamman conquers fear and dispels severe karmic blocks.' },
      { label: 'Lord Shiva / Sarabeswarar / Lingam', labelTamil: 'சிவன் / சரபேஸ்வரர் / தட்சிணாமூர்த்தி', graha: 'sani', reason: 'Lord Sarabeswarar instantly cures planetary adversity.' },
      { label: 'Lord Murugan / Karthikeya', labelTamil: 'முருகப்பெருமான் / தண்டாயுதபாணி', graha: 'sev', reason: 'Lord Muruga is the ruling deity of Sevvai and brings victory.' },
      { label: 'Lord Vishnu / Ranganatha / Perumal', labelTamil: 'பெருமாள் / விஷ்ணு / நாராயணன்', graha: 'puth', reason: 'Lord Budha aligns with Sri Vishnu for prosperity and intelligence.' }
    ]
  }
];
