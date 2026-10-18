import { Temple } from '../types';

export interface DynamicRemedy {
  id: string;
  label: string;
  tamilLabel: string;
  keywords: string[];
  count: number;
}

// Master list of known spiritual and astrological remedies in Hindu traditions
export const BASE_REMEDY_DEFINITIONS: Omit<DynamicRemedy, 'count'>[] = [
  {
    id: 'child_boon',
    label: 'Child Boon / Santhana Gopalan',
    tamilLabel: 'குழந்தைப் பேறு / சந்தான பாக்கியம்',
    keywords: ['குழந்தை', 'புத்திர', 'சந்தான', 'மழலை', 'கருப்பை', 'கர்ப்ப'],
  },
  {
    id: 'destiny_longevity',
    label: 'Destiny Relief & Longevity',
    tamilLabel: 'விதி மாற்றம் / ஆயுள் பலம்',
    keywords: ['விதி', 'ஆயுள்', 'மரண', 'மிருத்யுஞ்சய', 'விதியை மாற்றும்', 'மறுபிறவி'],
  },
  {
    id: 'marriage_hurdles',
    label: 'Marriage Obstacles Removal',
    tamilLabel: 'திருமணத் தடை நீங்குதல் / மாங்கல்ய பலம்',
    keywords: ['திருமண', 'கல்யாண', 'மாங்கல்ய', 'சுபகாரிய', 'களத்திர'],
  },
  {
    id: 'saturn_shani',
    label: 'Saturn (Shani) Relief & Sade Sati',
    tamilLabel: 'சனி தோஷ நிவர்த்தி / ஏழரை சனி',
    keywords: ['சனி', 'நீச்ச', 'ஏழரை', 'கண்ட சனி', 'அஷ்டம சனி', 'சனீஸ்வர'],
  },
  {
    id: 'sarpa_rahu_ketu',
    label: 'Rahu-Ketu / Sarpa & Kalasarpa Dosha',
    tamilLabel: 'நாக தோஷம் & ராகு கேது பரிகாரம்',
    keywords: ['நாக', 'ராகு', 'கேது', 'சர்ப்ப', 'காளசர்ப்ப', 'நாகலிங்க'],
  },
  {
    id: 'chevvai_dosha',
    label: 'Mars / Chevvai / Manglik Dosha',
    tamilLabel: 'செவ்வாய் தோஷம் / அங்காரக பரிகாரம்',
    keywords: ['செவ்வாய்', 'அங்காரக', 'பூமி', 'மங்கள', 'செவ்'],
  },
  {
    id: 'career_business',
    label: 'Career, Job & Business Growth',
    tamilLabel: 'வேலைவாய்ப்பு & தொழில் முன்னேற்றம்',
    keywords: ['வேலை', 'தொழில்', 'உத்தியோக', 'வியாபார', 'பதவி', 'முன்னேற்றம்'],
  },
  {
    id: 'debt_enemies',
    label: 'Relief from Debts & Enemies',
    tamilLabel: 'கடன் சுமை & எதிரிகள் பயம் தீர',
    keywords: ['கடன்', 'எதிரி', 'பகை', 'வழக்கு', 'ருண', 'சத்ரு'],
  },
  {
    id: 'health_healing',
    label: 'Health, Diseases & Chronic Illness Healing',
    tamilLabel: 'தீராத பிணிகள் குணமாக & ஆரோக்கியம்',
    keywords: ['பிணி', 'நோய்', 'மருத்துவ', 'ஆரோக்கிய', 'வைத்திய', 'சுகம்'],
  },
  {
    id: 'wisdom_education',
    label: 'Wisdom, Education & Memory',
    tamilLabel: 'கல்வி & ஞானம் / நினைவாற்றல்',
    keywords: ['கல்வி', 'படிப்பு', 'ஞான', 'சரஸ்வதி', 'மேதை', 'புத்தி'],
  },
  {
    id: 'guru_grace',
    label: 'Jupiter / Guru Grace & Wealth',
    tamilLabel: 'குரு பலம் & செல்வ வளம்',
    keywords: ['குரு', 'வியாழ', 'பிரகஸ்பதி', 'தன', 'செல்வ', 'வளம்'],
  },
  {
    id: 'ancestral_pitru',
    label: 'Pitru Dosha & Ancestral Peace',
    tamilLabel: 'பித்ரு தோஷம் & முன்னோர் ஆசி',
    keywords: ['பித்ரு', 'திதி', 'தர்ப்பண', 'முன்னோர்', 'அமாவாசை'],
  },
];

/**
 * Dynamically computes remedy counts across actual temples in database
 * and dynamically incorporates any custom tags defined by contributors.
 */
export function getDynamicRemedies(temples: Temple[]): DynamicRemedy[] {
  // 1. Compute counts for standard categories
  const standardList: DynamicRemedy[] = BASE_REMEDY_DEFINITIONS.map(def => {
    let count = 0;
    for (const t of temples) {
      const textToSearch = [
        t.significance || '',
        t.descriptionTamil || '',
        t.pariharamInfo || '',
        ...(t.remedies || []),
      ].join(' ').toLowerCase();

      const matches = def.keywords.some(kw => textToSearch.includes(kw.toLowerCase()));
      if (matches) {
        count++;
      }
    }
    return {
      ...def,
      count,
    };
  });

  // 2. Discover any unique custom tags in temple.remedies not already covered
  const customTagMap = new Map<string, number>();
  for (const t of temples) {
    if (t.remedies && Array.isArray(t.remedies)) {
      for (const tag of t.remedies) {
        const cleanTag = tag.trim();
        if (!cleanTag) continue;
        const alreadyCovered = standardList.some(s =>
          s.tamilLabel.toLowerCase().includes(cleanTag.toLowerCase()) ||
          s.keywords.some(k => k.toLowerCase() === cleanTag.toLowerCase())
        );
        if (!alreadyCovered) {
          customTagMap.set(cleanTag, (customTagMap.get(cleanTag) || 0) + 1);
        }
      }
    }
  }

  const customList: DynamicRemedy[] = Array.from(customTagMap.entries()).map(([tag, count]) => ({
    id: `custom-${tag.toLowerCase().replace(/\s+/g, '_')}`,
    label: tag,
    tamilLabel: tag,
    keywords: [tag.toLowerCase()],
    count,
  }));

  // Combine and sort: categories with temples > 0 appear first, sorted by count descending
  const combined = [...standardList, ...customList];
  return combined.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.tamilLabel.localeCompare(b.tamilLabel);
  });
}
