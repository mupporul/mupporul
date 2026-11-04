import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Temple, TempleSubmission, UserProfile, Deity } from '../types.js';

dotenv.config();

export function resolveSupabaseCredentials(
  env: Record<string, string | undefined> = process.env,
): { url: string; key: string } | null {
  const url = env.SUPABASE_URL?.trim();
  const key = [
    env.SUPABASE_SERVICE_ROLE_KEY,
    env.SUPABASE_KEY,
    env.SUPABASE_ANON_KEY,
  ].find((value) => value?.trim())?.trim();
  return url && key ? { url, key } : null;
}

const credentials = resolveSupabaseCredentials();

export const isSupabaseConfigured = Boolean(credentials);

export const supabase: SupabaseClient | null = credentials
  ? createClient(credentials.url, credentials.key, {
      auth: { persistSession: false },
    })
  : null;

if (isSupabaseConfigured) {
  console.log('[Supabase] Initialized cloud PostgreSQL database client.');
} else {
  console.log('[Supabase] Supabase credentials not set; using local JSON database.');
}

// ==========================================
// SUPABASE DATABASE ADAPTER METHODS
// ==========================================

export function toSupabaseTempleRow(temple: Temple): Record<string, unknown> {
  return {
    id: temple.id,
    name: temple.name || 'Sacred Temple',
    name_tamil: temple.nameTamil || null,
    location: temple.location || '',
    state: temple.state || 'Tamil Nadu',
    district: temple.district || null,
    planets: Array.isArray(temple.planets) ? temple.planets : [],
    deity: temple.deity || 'shivan',
    significance: temple.significance || '',
    description_tamil: temple.descriptionTamil || null,
    description_english: temple.descriptionEnglish || null,
    pariharam_info: temple.pariharamInfo || null,
    image_url: temple.imageUrl || '',
    video_url: temple.videoUrl || '',
    timings: temple.timings || '',
    history: temple.history || '',
    pooja_details: temple.poojaDetails || '',
    contact_number: temple.contactNumber || '',
    latitude: temple.coordinates?.lat ?? null,
    longitude: temple.coordinates?.lng ?? null,
    submitted_by: temple.submittedBy || {
      id: 'user-admin',
      name: 'Admin Murugan',
      role: 'admin',
    },
    views_count: temple.viewsCount || 0,
    created_at: temple.createdAt || new Date().toISOString(),
    updated_at: temple.updatedAt || new Date().toISOString(),
  };
}

export function toSupabaseUserRow(user: UserProfile): Record<string, unknown> {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    password: user.password,
    email: user.email || null,
    role: user.role,
    avatar_text: user.avatarText,
    avatar_color: user.avatarColor,
    contributions_count: user.contributionsCount || 0,
    approved_count: user.approvedCount || 0,
    created_at: user.createdAt || new Date().toISOString(),
  };
}

export async function fetchTemplesFromSupabase(): Promise<Temple[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('temples')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching temples:', error.message);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    location: row.location,
    state: row.state,
    nameTamil: row.name_tamil || undefined,
    district: row.district || undefined,
    planets: row.planets || [],
    deity: row.deity,
    significance: row.significance,
    remedies: [],
    descriptionTamil: row.description_tamil || undefined,
    descriptionEnglish: row.description_english || undefined,
    pariharamInfo: row.pariharam_info || undefined,
    imageUrl: row.image_url,
    videoUrl: row.video_url || '',
    timings: row.timings || '',
    history: row.history || '',
    poojaDetails: row.pooja_details || '',
    contactNumber: row.contact_number || '',
    coordinates: row.latitude != null && row.longitude != null
      ? { lat: Number(row.latitude), lng: Number(row.longitude) }
      : undefined,
    submittedBy: row.submitted_by,
    viewsCount: row.views_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function insertTempleToSupabase(temple: Temple): Promise<Temple> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('temples').upsert(toSupabaseTempleRow(temple));
  if (error) {
    console.error('[Supabase] Error inserting/upserting temple:', error.message);
    throw error;
  }
  return temple;
}

export async function updateTempleInSupabase(id: string, updates: Partial<Temple>): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const row: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) row.name = updates.name;
  if (updates.location !== undefined) row.location = updates.location;
  if (updates.state !== undefined) row.state = updates.state;
  if (updates.planets !== undefined) row.planets = updates.planets;
  if (updates.deity !== undefined) row.deity = updates.deity;
  if (updates.significance !== undefined) row.significance = updates.significance;
  if (updates.nameTamil !== undefined) row.name_tamil = updates.nameTamil;
  if (updates.district !== undefined) row.district = updates.district;
  if (updates.descriptionTamil !== undefined) row.description_tamil = updates.descriptionTamil;
  if (updates.descriptionEnglish !== undefined) row.description_english = updates.descriptionEnglish;
  if (updates.pariharamInfo !== undefined) row.pariharam_info = updates.pariharamInfo;
  if (updates.imageUrl !== undefined) row.image_url = updates.imageUrl;
  if (updates.videoUrl !== undefined) row.video_url = updates.videoUrl;
  if (updates.timings !== undefined) row.timings = updates.timings;
  if (updates.history !== undefined) row.history = updates.history;
  if (updates.poojaDetails !== undefined) row.pooja_details = updates.poojaDetails;
  if (updates.contactNumber !== undefined) row.contact_number = updates.contactNumber;
  if (updates.coordinates !== undefined) {
    row.latitude = updates.coordinates?.lat ?? null;
    row.longitude = updates.coordinates?.lng ?? null;
  }
  if (updates.viewsCount !== undefined) row.views_count = updates.viewsCount;

  const { error } = await supabase.from('temples').update(row).eq('id', id);
  if (error) {
    console.error('[Supabase] Error updating temple:', error.message);
    throw error;
  }
}

export async function deleteTempleFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('temples').delete().eq('id', id);
  if (error) {
    console.error('[Supabase] Error deleting temple:', error.message);
    throw error;
  }
  return true;
}

export async function clearAllTemplesFromSupabase(): Promise<boolean> {
  if (!supabase) return false;
  // Delete all rows where id is not empty
  const { error } = await supabase.from('temples').delete().neq('id', '');
  if (error) {
    console.error('[Supabase] Error clearing all temples:', error.message);
    throw error;
  }
  return true;
}

export async function fetchUsersFromSupabase(): Promise<UserProfile[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('[Supabase] Error fetching users:', error.message);
    return [];
  }
  return (data || []).map((u: any) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    password: u.password,
    email: u.email || '',
    role: u.role,
    avatarText: u.avatar_text || 'U',
    avatarColor: u.avatar_color || '#3182ce',
    contributionsCount: u.contributions_count || 0,
    approvedCount: u.approved_count || 0,
    createdAt: u.created_at,
  }));
}

export async function insertUserToSupabase(user: UserProfile): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('users').insert([toSupabaseUserRow(user)]);
  if (error) {
    console.error('[Supabase] Error inserting user:', error.message);
    throw error;
  }
}

export async function updateUserPasswordInSupabase(userId: string, newPass: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('users').update({ password: newPass }).eq('id', userId);
  return !error;
}

export async function deleteUserFromSupabase(userId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('users').delete().eq('id', userId);
  return !error;
}

// ==========================================
// DEITIES METHODS
// ==========================================

export async function fetchDeitiesFromSupabase(): Promise<Deity[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('deities')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Supabase] Could not fetch deities:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      nameTamil: row.name_tamil,
      nameEnglish: row.name_english,
    }));
  } catch (err) {
    console.warn('[Supabase] Exception fetching deities:', err);
    return [];
  }
}

export async function insertDeityToSupabase(deity: Deity): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('deities').upsert({
      id: deity.id,
      name_tamil: deity.nameTamil,
      name_english: deity.nameEnglish,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function updateDeityInSupabase(id: string, updates: Partial<Deity>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload: any = {};
    if (updates.nameTamil) payload.name_tamil = updates.nameTamil;
    if (updates.nameEnglish) payload.name_english = updates.nameEnglish;
    const { error } = await supabase.from('deities').update(payload).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteDeityFromSupabase(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('deities').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// SUBMISSIONS METHODS
// ==========================================

export const safeParseJson = (val: any) => {
  if (!val) return {};
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
};

export function normalizeSupabaseSubmission(row: any): TempleSubmission {
  const templeData = safeParseJson(row.temple_data);
  const submittedBy = safeParseJson(row.submitted_by);
  const reviewedBy = row.reviewed_by ? safeParseJson(row.reviewed_by) : undefined;

  return {
    id: row.id,
    type: row.type || 'new',
    templeId: row.temple_id || undefined,
    templeData: {
      name: templeData?.name || 'Sacred Temple',
      location: templeData?.location || '',
      state: templeData?.state || 'Tamil Nadu',
      planets: Array.isArray(templeData?.planets) ? templeData.planets : [],
      deity: templeData?.deity || 'shivan',
      significance: templeData?.significance || templeData?.descriptionTamil || '',
      imageUrl: templeData?.imageUrl || '',
      videoUrl: templeData?.videoUrl || '',
      timings: templeData?.timings || '',
      history: templeData?.history || '',
      poojaDetails: templeData?.poojaDetails || '',
      contactNumber: templeData?.contactNumber || '',
      remedies: [],
    },
    previousData: row.previous_data ? safeParseJson(row.previous_data) : undefined,
    submittedBy: {
      id: submittedBy?.id || 'contributor',
      name: submittedBy?.name || 'Contributor',
      email: submittedBy?.email || '',
      role: submittedBy?.role || 'contributor',
    },
    submittedAt: row.submitted_at || new Date().toISOString(),
    status: (row.status || 'pending').toLowerCase() as 'pending' | 'approved' | 'rejected',
    reviewedBy: reviewedBy ? {
      id: reviewedBy?.id || '',
      name: reviewedBy?.name || '',
      role: reviewedBy?.role || '',
    } : undefined,
    reviewedAt: row.reviewed_at || undefined,
    reviewNotes: row.review_notes || '',
  };
}

export async function fetchSubmissionsFromSupabase(): Promise<TempleSubmission[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Could not fetch submissions:', error.message);
      return [];
    }

    return (data || []).map(normalizeSupabaseSubmission);
  } catch (err: any) {
    console.warn('[Supabase] Exception fetching submissions:', err);
    return [];
  }
}

export async function insertSubmissionToSupabase(sub: TempleSubmission): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('submissions').upsert({
      id: sub.id,
      type: sub.type,
      temple_id: sub.templeId,
      temple_data: sub.templeData,
      previous_data: sub.previousData,
      submitted_by: sub.submittedBy,
      submitted_at: sub.submittedAt,
      status: sub.status,
      reviewed_by: sub.reviewedBy,
      reviewed_at: sub.reviewedAt,
      review_notes: sub.reviewNotes,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function updateSubmissionInSupabase(id: string, updates: Partial<TempleSubmission>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload: any = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.reviewedBy !== undefined) payload.reviewed_by = updates.reviewedBy;
    if (updates.reviewedAt !== undefined) payload.reviewed_at = updates.reviewedAt;
    if (updates.reviewNotes !== undefined) payload.review_notes = updates.reviewNotes;
    if (updates.templeData !== undefined) payload.temple_data = updates.templeData;

    const { error } = await supabase.from('submissions').update(payload).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// SUPABASE STORAGE (IMAGE UPLOADS)
// ==========================================

export async function uploadImageToSupabaseStorage(
  base64Data: string,
  fileName: string,
  mimeType: string = 'image/jpeg'
): Promise<{ url: string | null; error?: string }> {
  if (!supabase) {
    return { url: null, error: 'Supabase is not configured on the backend server.' };
  }

  try {
    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'temple-images';

    const ext = fileName.includes('.') ? fileName.split('.').pop() : 'jpg';
    const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = `temples/${Date.now()}-${cleanName}.${ext}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.warn(`[Supabase Storage] Upload error to bucket '${bucket}':`, error.message);
      return { url: null, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error('[Supabase Storage] Exception during upload:', err.message);
    return { url: null, error: err.message };
  }
}
