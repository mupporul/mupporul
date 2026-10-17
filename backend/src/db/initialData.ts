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
    contributionsCount: 12,
    approvedCount: 12
  },
  {
    id: 'user-vk',
    name: 'Vasanth Kumar (VK)',
    username: 'vkraman',
    email: 'vk@mupporul.app',
    password: 'vk123',
    role: 'contributor',
    avatarText: 'VK',
    avatarColor: '#f5a623',
    contributionsCount: 8,
    approvedCount: 7
  },
  {
    id: 'user-pilgrim',
    name: 'Arulmozhi Varman',
    username: 'pilgrim',
    email: 'arul@mupporul.app',
    password: 'user123',
    role: 'user',
    avatarText: 'AV',
    avatarColor: '#38bdf8',
    contributionsCount: 0,
    approvedCount: 0
  }
];

export const INITIAL_TEMPLES: Temple[] = [
  {
    id: 'temple-melmalayanoor',
    name: 'Angalaparameshwari Temple',
    location: 'Melmalayanoor, Tamil Nadu',
    state: 'Tamil Nadu',
    planets: ['sani', 'suri'],
    deity: 'amman',
    significance: 'சனி நீச்சத்தின் பரிகாரம், வேலைவாய்ப்பு கிடைக்க, சனி நீச்சத்தால் ஏற்படும் பாதிப்பு குணமடைய அமாவாசை நள்ளிரவு ஊஞ்சல் தரிசனம் மற்றும் அங்காளம்மன் அருள்.',
    descriptionEnglish: 'Sacred Swayambhu Shakthi Peetham dedicated to Goddess Angala Parameshwari. Famed for Amavasya Oonjal Sevai and relief from severe Saturn (Shani) doshas and Surya doshas.',
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    timings: 'காலை 6:00 - இரவு 9:00 (அமாவாசை நாட்களில் 24 மணி நேரமும் திறந்திருக்கும்)',
    history: 'Melmalayanoor is one of the most revered Shakti shrines where the Goddess freed Lord Shiva from Brahma\'s skull (Kapala Vimochana). Millions gather here on new moon nights.',
    poojaDetails: 'அபிஷேகம், பாலாபிஷேகம், தீமிதி உற்சவம், மயான கொள்ளை பெருவிழா',
    contactNumber: '+91 4145 234234',
    coordinates: { lat: 12.2475, lng: 79.4042 },
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-03-01T14:30:00Z',
    submittedBy: {
      id: 'user-vk',
      name: 'Vasanth Kumar (VK)',
      role: 'contributor'
    },
    viewsCount: 3840
  },
  {
    id: 'temple-thirubuvanam',
    name: 'Sri Sarabeswarar Temple',
    location: 'Thirubuvanam, Tanjore, Tamil Nadu',
    state: 'Tamil Nadu',
    planets: ['sani', 'rahu'],
    deity: 'shivan',
    significance: 'எதிரிகள் பயம் நீங்க, ராகு தோஷம் விலக, தீராத பிணிகள் தீர, ஞாயிறு ராகு கால வடை மாலை அர்ச்சனை மற்றும் சரபேஸ்வரர் வழிபாடு.',
    descriptionEnglish: 'Magnificent Chola architectural marvel housing Lord Sarabeswarar (an avatar of Shiva combined with bird and lion to pacify Ugra Narasimha). Exceptional for Rahu-Shani remedies.',
    imageUrl: 'https://images.unsplash.com/photo-1621360841013-c7683c659ec6?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    timings: 'காலை 6:00 - 12:30, மாலை 4:00 - இரவு 8:30',
    history: 'Built by Kulothunga Chola III in the 13th century. The vimana stands 126 feet tall, displaying supreme Dravidian sculpting.',
    poojaDetails: 'பிரதோஷம், ராகு கால அர்ச்சனை, விசேஷ ருத்ராபிஷேகம்',
    contactNumber: '+91 435 2460258',
    coordinates: { lat: 10.9833, lng: 79.4333 },
    createdAt: '2026-01-15T11:00:00Z',
    updatedAt: '2026-02-28T09:15:00Z',
    submittedBy: {
      id: 'user-vk',
      name: 'Vasanth Kumar (VK)',
      role: 'contributor'
    },
    viewsCount: 2950
  },
  {
    id: 'temple-thirubavanoor',
    name: 'Angalaparameshwari Temple',
    location: 'Thirubavanoor, Tamil Nadu',
    state: 'Tamil Nadu',
    planets: ['sani', 'kethu'],
    deity: 'amman',
    significance: 'நாக தோஷம் நிவர்த்தி, கேது பரிகாரம், பூர்வ புண்ணிய தோஷங்கள் தீர, புற்று வழிபாடு மற்றும் அங்காளம்மன் பிரசாதம்.',
    descriptionEnglish: 'Ancient village sanctuary dedicated to Goddess Angalamman with special snake anthill (Putru) worship, bringing deliverance from Ketu and Sarpa doshas.',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    timings: 'காலை 6:30 - 1:00, மாலை 4:30 - இரவு 8:00',
    history: 'A consecrated siddha sthalam worshipped by sages for centuries.',
    poojaDetails: 'செவ்வாய், வெள்ளி சிறப்பு பூசைகள் மற்றும் பௌர்ணமி விளக்கு பூஜை',
    contactNumber: '+91 4145 291083',
    coordinates: { lat: 11.9338, lng: 79.4938 },
    createdAt: '2026-01-20T14:00:00Z',
    updatedAt: '2026-02-14T16:45:00Z',
    submittedBy: {
      id: 'user-admin',
      name: 'Admin Murugan',
      role: 'admin'
    },
    viewsCount: 1820
  },
  {
    id: 'temple-thirunallar',
    name: 'Thirunallar Saniswaran Temple',
    location: 'Thirunallar, Karaikal, Puducherry',
    state: 'Puducherry',
    planets: ['sani'],
    deity: 'shivan',
    significance: 'ஏழரை சனி, அஷ்டம சனி, கண்டக சனி தாக்கங்களிலிருந்து விடுபட நள தீர்த்தத்தில் நீராடி எள் தீபம் ஏற்றி சனீஸ்வர பகவானை வழிபட சனி தோஷங்கள் யாவும் அகலும்.',
    descriptionEnglish: 'World-renowned temple where King Nala was released from the malefic grip of Lord Shani. Bathing in the holy Nala Theertham cleanses karmic burdens.',
    imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    timings: 'காலை 5:00 - 12:30, மாலை 4:00 - இரவு 9:00',
    history: 'One of the celebrated Padal Petra Sthalams. Dharbaranyeswarar is the presiding deity, with a dedicated powerful shrine for Lord Shani.',
    poojaDetails: 'சனிப்பெயர்ச்சி மகா திருவிழா, தில ஹோமம், எள் தீப ஆராதனை',
    contactNumber: '+91 4368 236530',
    coordinates: { lat: 10.9298, lng: 79.7919 },
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-03-05T12:00:00Z',
    submittedBy: {
      id: 'user-admin',
      name: 'Admin Murugan',
      role: 'admin'
    },
    viewsCount: 6420
  },
  {
    id: 'temple-suryanar',
    name: 'Suryanar Kovil',
    location: 'Aaduthurai, Thanjavur, Tamil Nadu',
    state: 'Tamil Nadu',
    planets: ['suri'],
    deity: 'shivan',
    significance: 'கண் பார்வை தெளிவு, அரசு வேலை யோகம், இதய நலம், பித்ரு தோஷ நிவர்த்திக்கு முதன்மை தலம், செந்தாமரை மலர் வழிபாடு.',
    descriptionEnglish: 'The principal Navagraha temple where Sun God (Surya) is worshipped with all eight other planets in their separate sanctums facing Surya.',
    imageUrl: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    timings: 'காலை 6:00 - 12:30, மாலை 4:00 - இரவு 8:00',
    history: 'Built during the reign of Kulottunga Choladeva (11th century). Highly praised in ancient Tamil literature.',
    poojaDetails: 'சூரிய நமஸ்காரம், ரத சப்தமி பெருவிழா, விசேஷ உஷத்கால பூசை',
    contactNumber: '+91 435 2472349',
    coordinates: { lat: 11.0261, lng: 79.5262 },
    createdAt: '2026-01-08T09:00:00Z',
    updatedAt: '2026-02-18T10:15:00Z',
    submittedBy: {
      id: 'user-admin',
      name: 'Admin Murugan',
      role: 'admin'
    },
    viewsCount: 4120
  },
  {
    id: 'temple-vaitheeswaran',
    name: 'Vaitheeswaran Koil (Chevvai Sthalam)',
    location: 'Vaitheeswaran Koil, Mayiladuthurai, Tamil Nadu',
    state: 'Tamil Nadu',
    planets: ['sev'],
    deity: 'murugan',
    significance: 'செவ்வாய் தோஷம் விலக, திருமண தடை நீங்க, தீராத நோய்கள் குணமாக வைத்தியநாத சுவாமி மற்றும் முத்துக்குமாரசுவாமி அருள்.',
    descriptionEnglish: 'Navagraha sthalam for Planet Mars (Chevvai / Angarakan). Lord Shiva is Vaidyanatha (Divine Physician) and Lord Muruga is celebrated as Muthukumaraswamy.',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    timings: 'காலை 6:00 - 1:00, மாலை 4:00 - இரவு 9:00',
    history: 'The Siddhamirtham holy tank water is renowned for medicinal healing qualities. Center of ancient Palm Leaf Nadi Astrology.',
    poojaDetails: 'அங்காரக பூசை, முத்துக்குமாரசுவாமி அபிஷேகம், திருக்கார்த்திகை தீபம்',
    contactNumber: '+91 4364 279423',
    coordinates: { lat: 11.2012, lng: 79.7118 },
    createdAt: '2026-01-12T15:00:00Z',
    updatedAt: '2026-02-25T11:00:00Z',
    submittedBy: {
      id: 'user-vk',
      name: 'Vasanth Kumar (VK)',
      role: 'contributor'
    },
    viewsCount: 5280
  },
  {
    id: 'temple-thirunageswaram',
    name: 'Thirunageswaram Naganathaswamy (Rahu Sthalam)',
    location: 'Thirunageswaram, Kumbakonam, Tamil Nadu',
    state: 'Tamil Nadu',
    planets: ['rahu'],
    deity: 'shivan',
    significance: 'ராகு பகவானுக்கு பாலாபிஷேகம் செய்யும்போது பால் நீல நிறமாக மாறும் அற்புத தலம், நாக தோஷ நிவர்த்தி மற்றும் காரிய சித்தி.',
    descriptionEnglish: 'Supreme shrine for Rahu Bhagavan. During Rahu Kaalam milk abishekam, the white milk miraculously turns light blue upon touching Rahu idol.',
    imageUrl: 'https://images.unsplash.com/photo-1621360841013-c7683c659ec6?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    timings: 'காலை 6:00 - 12:45, மாலை 4:00 - இரவு 8:30',
    history: 'Consecrated by Serpent King Adisesha, Daksha and Karkotaka. Praised by Appar, Sundarar and Sambandar.',
    poojaDetails: 'ராகு கால பாலாபிஷேகம், கார்த்திகை கார்த்திகை பெருவிழா',
    contactNumber: '+91 435 2463354',
    coordinates: { lat: 10.9634, lng: 79.4312 },
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-02-20T17:00:00Z',
    submittedBy: {
      id: 'user-admin',
      name: 'Admin Murugan',
      role: 'admin'
    },
    viewsCount: 4890
  },
  {
    id: 'temple-alangudi',
    name: 'Alangudi Apatsahayeswarar (Guru Sthalam)',
    location: 'Alangudi, Valangaiman, Tamil Nadu',
    state: 'Tamil Nadu',
    planets: ['guru'],
    deity: 'shivan',
    significance: 'குரு பகவான் அருள் பெற, புத்திர பாக்கியம் கிட்ட, கல்வி அறிவு மேன்மையடைய முதன்மை குரு பரிகார தலம் மற்றும் தட்சிணாமூர்த்தி வழிபாடு.',
    descriptionEnglish: 'Foremost Navagraha sthalam for Jupiter (Guru / Dakshinamurthy). Lord Shiva consumed Alahala poison here to protect the universe, earning the name Apatsahayar.',
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    timings: 'காலை 6:00 - 1:00, மாலை 4:00 - இரவு 9:00',
    history: 'Lord Dakshinamurthy sits facing south in a majestic single stone carving.',
    poojaDetails: 'குருப்பெயர்ச்சி லட்சார்ச்சனை, கார்த்திகை சோமவாரம்',
    contactNumber: '+91 4374 269407',
    coordinates: { lat: 10.8123, lng: 79.4123 },
    createdAt: '2026-01-22T13:00:00Z',
    updatedAt: '2026-03-02T15:20:00Z',
    submittedBy: {
      id: 'user-vk',
      name: 'Vasanth Kumar (VK)',
      role: 'contributor'
    },
    viewsCount: 3750
  }
];

export const INITIAL_SUBMISSIONS: TempleSubmission[] = [
  {
    id: 'sub-new-kanjanur',
    type: 'new',
    status: 'pending',
    submittedAt: '2026-03-10T11:45:00Z',
    submittedBy: {
      id: 'user-vk',
      name: 'Vasanth Kumar (VK)',
      email: 'vk@mupporul.app',
      role: 'contributor'
    },
    templeData: {
      name: 'Kanjanur Agneeswarar Temple (Sukran Sthalam)',
      location: 'Kanjanur, Kumbakonam, Tamil Nadu',
      state: 'Tamil Nadu',
      planets: ['suk'],
      deity: 'shivan',
      significance: 'சுக்ர தோஷம் நீங்க, கலைகளில் வெற்றி பெற, செல்வ வளம் அதிகரிக்க அக்னீஸ்வரரை வெள்ளிக்கிழமைகளில் மொச்சை தானியம் சாற்றி வழிபட சுக்கிர பலம் கிட்டும்.',
      descriptionEnglish: 'Sacred Navagraha shrine dedicated to Planet Venus (Sukran). Lord Shiva blessed Sukracharya with the secret Sanjeevini Mantra here.',
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      timings: 'காலை 6:00 - 12:00, மாலை 4:00 - இரவு 8:00',
      history: 'Parasara Muni attained salvation here. The temple is praised in Thevaram hymns.',
      poojaDetails: 'சுக்கிர வார சிறப்பு அபிஷேகம், தைப்பூச உற்சவம்'
    }
  },
  {
    id: 'sub-edit-melmalayanoor',
    type: 'edit',
    templeId: 'temple-melmalayanoor',
    status: 'pending',
    submittedAt: '2026-03-12T09:20:00Z',
    submittedBy: {
      id: 'user-vk',
      name: 'Vasanth Kumar (VK)',
      email: 'vk@mupporul.app',
      role: 'contributor'
    },
    previousData: {
      timings: 'காலை 6:00 - இரவு 9:00 (அமாவாசை நாட்களில் 24 மணி நேரமும் திறந்திருக்கும்)',
      significance: 'சனி நீச்சத்தின் பரிகாரம், வேலைவாய்ப்பு கிடைக்க, சனி நீச்சத்தால் ஏற்படும் பாதிப்பு குணமடையு...'
    },
    templeData: {
      name: 'Angalaparameshwari Temple',
      location: 'Melmalayanoor, Viluppuram, Tamil Nadu',
      state: 'Tamil Nadu',
      planets: ['sani', 'suri'],
      deity: 'amman',
      significance: 'சனி நீச்சத்தின் பரிகாரம், வேலைவாய்ப்பு கிடைக்க, குடும்பத்தில் சுபகாரியங்கள் தடையின்றி நிகழ அமாவாசை நள்ளிரவு ஊஞ்சல் தரிசனம் மற்றும் அங்காளம்மன் அருள்.',
      descriptionEnglish: 'Sacred Swayambhu Shakthi Peetham dedicated to Goddess Angala Parameshwari. Famed for Amavasya Oonjal Sevai and relief from severe Saturn (Shani) doshas and Surya doshas.',
      imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      timings: 'காலை 5:30 - இரவு 9:30 (அமாவாசை மற்றும் பௌர்ணமி தினங்களில் இரவு முழுவதும் திறந்திருக்கும்)',
      history: 'Melmalayanoor is one of the most revered Shakti shrines where the Goddess freed Lord Shiva from Brahma\'s skull (Kapala Vimochana). Millions gather here on new moon nights.',
      poojaDetails: 'அபிஷேகம், பாலாபிஷேகம், அமாவாசை ஊஞ்சல் உற்சவம், மயான கொள்ளை பெருவிழா',
      contactNumber: '+91 4145 234234'
    }
  }
];

export const INITIAL_BOOKMARKS: string[] = ['temple-melmalayanoor'];
