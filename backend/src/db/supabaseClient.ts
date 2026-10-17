import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Temple, TempleSubmission, UserProfile } from '../types.js';

dotenv.config();

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

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    location: row.location,
    state: row.state,
    planets: row.planets || [],
    deity: row.deity,
    significance: row.significance,
    imageUrl: row.image_url,
    videoUrl: row.video_url || '',
    timings: row.timings || '',
    history: row.history || '',
    poojaDetails: row.pooja_details || '',
    contactNumber: row.contact_number || '',
    submittedBy: row.submitted_by,
    viewsCount: row.views_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function insertTempleToSupabase(temple: Temple): Promise<Temple> {
  if (!supabase) throw new Error('Supabase not configured');
  const row = {
    id: temple.id,
    name: temple.name,
    location: temple.location,
    state: temple.state,
    planets: temple.planets,
    deity: temple.deity,
    significance: temple.significance,
    image_url: temple.imageUrl,
    video_url: temple.videoUrl,
    timings: temple.timings,
    history: temple.history,
    pooja_details: temple.poojaDetails,
    contact_number: temple.contactNumber,
    submitted_by: temple.submittedBy,
    views_count: temple.viewsCount,
    created_at: temple.createdAt,
    updated_at: temple.updatedAt,
  };

  const { error } = await supabase.from('temples').insert([row]);
  if (error) {
    console.error('[Supabase] Error inserting temple:', error.message);
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
  if (updates.imageUrl !== undefined) row.image_url = updates.imageUrl;
  if (updates.videoUrl !== undefined) row.video_url = updates.videoUrl;
  if (updates.timings !== undefined) row.timings = updates.timings;
  if (updates.history !== undefined) row.history = updates.history;
  if (updates.poojaDetails !== undefined) row.pooja_details = updates.poojaDetails;
  if (updates.contactNumber !== undefined) row.contact_number = updates.contactNumber;
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

export async function deleteUserFromSupabase(userId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('users').delete().eq('id', userId);
  return !error;
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

