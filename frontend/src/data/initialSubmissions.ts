import { TempleSubmission } from '../types';

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
  },
  {
    id: 'sub-approved-thirunageswaram',
    type: 'new',
    status: 'approved',
    submittedAt: '2026-02-18T10:00:00Z',
    reviewedAt: '2026-02-20T17:00:00Z',
    submittedBy: {
      id: 'user-vk',
      name: 'Vasanth Kumar (VK)',
      email: 'vk@mupporul.app',
      role: 'contributor'
    },
    reviewedBy: {
      id: 'user-admin',
      name: 'Admin Murugan',
      role: 'admin'
    },
    reviewNotes: 'Verified temple timings and milk abishekam specifics. Approved for public catalog.',
    templeData: {
      name: 'Thirunageswaram Naganathaswamy (Rahu Sthalam)',
      location: 'Thirunageswaram, Kumbakonam, Tamil Nadu',
      state: 'Tamil Nadu',
      planets: ['rahu'],
      deity: 'shivan',
      significance: 'ராகு பகவானுக்கு பாலாபிஷேகம் செய்யும்போது பால் நீல நிறமாக மாறும் அற்புத தலம், நாக தோஷ நிவர்த்தி.',
      descriptionEnglish: 'Supreme shrine for Rahu Bhagavan.',
      imageUrl: 'https://images.unsplash.com/photo-1621360841013-c7683c659ec6?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      timings: 'காலை 6:00 - 12:45, மாலை 4:00 - இரவு 8:30'
    }
  }
];
