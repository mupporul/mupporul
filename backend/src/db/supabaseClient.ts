import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Temple, TempleSubmission, UserProfile, Deity, SolutionTag } from '../types.js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })
  : null;

if (isSupabaseConfigured) {
  console.log('[Supabase] Initialized cloud PostgreSQL database client with URL:', supabaseUrl);
} else {
  console.log('[Supabase] No SUPABASE_URL / SUPABASE_KEY set; using fast local JSON database.');
}

// ==========================================
// SUPABASE DATABASE ADAPTER METHODS
// ==========================================

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

  return (data || []).map((row: any) => {
    const rawSubmittedBy = row.submitted_by && typeof row.submitted_by === 'object' ? row.submitted_by : undefined;
    const jpFlag =
      row.jothidar_paarvai !== undefined
        ? Boolean(row.jothidar_paarvai)
        : Boolean(rawSubmittedBy?.jothidarPaarvai);
    const jpNotes =
      row.jothidar_paarvai_notes !== undefined
        ? (row.jothidar_paarvai_notes || '')
        : (rawSubmittedBy?.jothidarPaarvaiNotes || '');
    const solutionTags = Array.isArray(rawSubmittedBy?.solutionTags)
      ? rawSubmittedBy.solutionTags.filter((id: any) => typeof id === 'string' && id.trim())
      : Array.isArray(row.solution_tags)
      ? row.solution_tags.filter((id: any) => typeof id === 'string' && id.trim())
      : [];

    const cleanSubmittedBy = rawSubmittedBy
      ? {
          id: rawSubmittedBy.id || 'user-admin',
          name: rawSubmittedBy.name || 'Admin Murugan',
          role: rawSubmittedBy.role || 'admin',
        }
      : undefined;

    return {
      id: row.id,
      name: row.name,
      location: row.location,
      state: row.state,
      planets: row.planets || [],
      deity: row.deity,
      significance: row.significance,
      remedies: [],
      solutionTags,
      imageUrl: row.image_url,
      videoUrl: row.video_url || '',
      timings: row.timings || '',
      history: row.history || '',
      poojaDetails: row.pooja_details || '',
      contactNumber: row.contact_number || '',
      jothidarPaarvai: jpFlag,
      jothidarPaarvaiNotes: jpNotes,
      submittedBy: cleanSubmittedBy,
      viewsCount: row.views_count || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

export function buildSupabaseTempleRow(temple: Temple) {
  const baseSubmittedBy = temple.submittedBy
    ? {
        id: temple.submittedBy.id,
        name: temple.submittedBy.name,
        role: temple.submittedBy.role,
      }
    : {
        id: 'user-admin',
        name: 'Admin Murugan',
        role: 'admin',
      };

  const hasJp = Boolean(temple.jothidarPaarvai || (temple.jothidarPaarvaiNotes && temple.jothidarPaarvaiNotes.trim()));
  const cleanSolutionTags = Array.isArray(temple.solutionTags)
    ? Array.from(new Set(temple.solutionTags.filter(id => typeof id === 'string' && id.trim())))
    : [];

  return {
    id: temple.id,
    name: temple.name || 'Sacred Temple',
    location: temple.location || '',
    state: temple.state || 'Tamil Nadu',
    planets: Array.isArray(temple.planets) ? temple.planets : [],
    deity: temple.deity || 'shivan',
    significance: temple.significance || '',
    image_url: temple.imageUrl || '',
    video_url: temple.videoUrl || '',
    timings: temple.timings || '',
    history: temple.history || '',
    pooja_details: temple.poojaDetails || '',
    contact_number: temple.contactNumber || '',
    submitted_by: {
      ...baseSubmittedBy,
      jothidarPaarvai: hasJp,
      jothidarPaarvaiNotes: hasJp ? (temple.jothidarPaarvaiNotes || '') : '',
      solutionTags: cleanSolutionTags,
    },
    views_count: temple.viewsCount || 0,
    created_at: temple.createdAt || new Date().toISOString(),
    updated_at: temple.updatedAt || new Date().toISOString(),
  };
}

export function buildSupabaseTempleUpdateRow(updates: Partial<Temple>, currentTemple?: Temple): Record<string, any> {
  const row: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) row.name = updates.name;
  if (updates.location !== undefined) row.location = updates.location;
  if (updates.state !== undefined) row.state = updates.state;
  if (updates.planets !== undefined) row.planets = updates.planets;
  if (updates.deity !== undefined) row.deity = updates.deity;
  if (updates.significance !== undefined) row.significance = updates.significance;
  if (updates.imageUrl !== undefined) row.image_url = updates.imageUrl;
  if (updates.videoUrl !== undefined) row.video_url = updates.videoUrl;
  if (updates.timings !== undefined) row.timings = updates.timings;
  if (updates.history !== undefined) row.history = updates.history;
  if (updates.poojaDetails !== undefined) row.pooja_details = updates.poojaDetails;
  if (updates.contactNumber !== undefined) row.contact_number = updates.contactNumber;
  if (updates.viewsCount !== undefined) row.views_count = updates.viewsCount;

  if (
    updates.jothidarPaarvai !== undefined ||
    updates.jothidarPaarvaiNotes !== undefined ||
    updates.solutionTags !== undefined ||
    updates.submittedBy !== undefined
  ) {
    const mergedSubmittedBy = updates.submittedBy || currentTemple?.submittedBy || {
      id: 'user-admin',
      name: 'Admin Murugan',
      role: 'admin',
    };
    const nextJp =
      updates.jothidarPaarvai !== undefined
        ? Boolean(updates.jothidarPaarvai)
        : Boolean(currentTemple?.jothidarPaarvai);
    const nextNotes =
      updates.jothidarPaarvaiNotes !== undefined
        ? updates.jothidarPaarvaiNotes
        : (currentTemple?.jothidarPaarvaiNotes || '');
    const nextSolutionTags =
      updates.solutionTags !== undefined
        ? Array.from(new Set((updates.solutionTags || []).filter(id => typeof id === 'string' && id.trim())))
        : Array.isArray(currentTemple?.solutionTags)
        ? currentTemple!.solutionTags
        : [];

    row.submitted_by = {
      id: mergedSubmittedBy.id,
      name: mergedSubmittedBy.name,
      role: mergedSubmittedBy.role,
      jothidarPaarvai: nextJp,
      jothidarPaarvaiNotes: nextJp ? (nextNotes || '') : '',
      solutionTags: nextSolutionTags,
    };
  }

  return row;
}

export async function insertTempleToSupabase(temple: Temple): Promise<Temple> {
  if (!supabase) throw new Error('Supabase not configured');
  const row = buildSupabaseTempleRow(temple);

  const { error } = await supabase.from('temples').upsert(row);
  if (error) {
    console.error('[Supabase] Error inserting/upserting temple:', error.message);
    throw error;
  }
  return temple;
}

export async function updateTempleInSupabase(
  id: string,
  updates: Partial<Temple>,
  currentTemple?: Temple
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const row = buildSupabaseTempleUpdateRow(updates, currentTemple);

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
  const { error } = await supabase.from('users').insert([{
    id: user.id,
    name: user.name,
    username: user.username,
    password: user.password,
    email: user.email || '',
    role: user.role,
    avatar_text: user.avatarText,
    avatar_color: user.avatarColor,
    contributions_count: user.contributionsCount || 0,
    approved_count: user.approvedCount || 0,
    created_at: new Date().toISOString(),
  }]);
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

export async function updateUserRoleInSupabase(userId: string, role: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);
  if (error) {
    console.error('[Supabase] Error updating user role:', error.message);
    throw error;
  }
  return true;
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

export async function fetchSolutionTagsFromSupabase(): Promise<SolutionTag[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('solution_tags')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && Array.isArray(data)) {
      return data.map((row: any) => ({
        id: row.id,
        nameTamil: row.name_tamil,
        nameEnglish: row.name_english || '',
      }));
    }

    // Fallback: read config record stored in submissions table so live production works without manual SQL DDL
    const { data: cfgRow, error: cfgErr } = await supabase
      .from('submissions')
      .select('temple_data')
      .eq('id', '__config_solution_tags__')
      .maybeSingle();

    if (!cfgErr && cfgRow?.temple_data) {
      const parsed = safeParseJson(cfgRow.temple_data);
      if (Array.isArray(parsed?.solutionTags)) {
        return parsed.solutionTags;
      }
    }
    return null;
  } catch (err) {
    console.warn('[Supabase] Exception fetching solution_tags:', err);
    return null;
  }
}

async function persistSolutionTagsFallback(allTags: SolutionTag[]): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('submissions').upsert({
      id: '__config_solution_tags__',
      type: 'config',
      temple_id: null,
      temple_data: { solutionTags: allTags },
      submitted_by: { id: 'system', name: 'System Config', role: 'admin' },
      submitted_at: new Date().toISOString(),
      status: 'config',
    });
    return !error;
  } catch {
    return false;
  }
}

export async function insertSolutionTagToSupabase(tag: SolutionTag, allTags: SolutionTag[]): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('solution_tags').upsert({
      id: tag.id,
      name_tamil: tag.nameTamil,
      name_english: tag.nameEnglish || '',
    });
    if (!error) return true;
  } catch {}
  return persistSolutionTagsFallback(allTags);
}

export async function updateSolutionTagInSupabase(
  id: string,
  updates: Partial<SolutionTag>,
  allTags: SolutionTag[]
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload: any = {};
    if (updates.nameTamil !== undefined) payload.name_tamil = updates.nameTamil;
    if (updates.nameEnglish !== undefined) payload.name_english = updates.nameEnglish;
    const { error } = await supabase.from('solution_tags').update(payload).eq('id', id);
    if (!error) return true;
  } catch {}
  return persistSolutionTagsFallback(allTags);
}

export async function deleteSolutionTagFromSupabase(id: string, allTags: SolutionTag[]): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('solution_tags').delete().eq('id', id);
    if (!error) return true;
  } catch {}
  return persistSolutionTagsFallback(allTags);
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
      jothidarPaarvai: Boolean(templeData?.jothidarPaarvai || (templeData?.jothidarPaarvaiNotes && templeData.jothidarPaarvaiNotes.trim())),
      jothidarPaarvaiNotes: templeData?.jothidarPaarvaiNotes || '',
      solutionTags: Array.isArray(templeData?.solutionTags) ? templeData.solutionTags : [],
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

    return (data || [])
      .filter((row: any) => row.id !== '__config_solution_tags__' && row.type !== 'config')
      .map(normalizeSupabaseSubmission);
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
    if (updates.templeId !== undefined) payload.temple_id = updates.templeId;
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

