import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  CheckCircle2,
  ShieldAlert,
  Upload,
  Trash2,
  RefreshCw,
  Link2,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  ExternalLink,
  Plus,
  Pencil,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PLANETS, STATES } from '../data/constants';
import { Temple } from '../types';
import { api } from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';

export const AddEditTempleModal: React.FC = () => {
  const {
    isAddEditModalOpen,
    closeAddEditModal,
    templeToEdit,
    submitTemple,
    currentUser,
    switchRole,
    setActiveTab,
    isMobileFrame,
    deities,
    createDeity,
    updateDeity,
    deleteDeity,
  } = useApp();

  const isEdit = !!templeToEdit;

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    state: 'Tamil Nadu',
    planets: [] as string[],
    deity: 'shivan',
    significance: '',
    remedies: [] as string[],
    imageUrl: '',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    timings: 'காலை 6:00 - 12:30, மாலை 4:00 - இரவு 8:30',
    history: '',
    poojaDetails: '',
    contactNumber: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [photoMode, setPhotoMode] = useState<'url' | 'upload'>('url');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Admin Deity Management Inline State
  const [deityModalMode, setDeityModalMode] = useState<'none' | 'add' | 'edit'>('none');
  const [deityFormTamil, setDeityFormTamil] = useState('');
  const [deityFormEnglish, setDeityFormEnglish] = useState('');
  const [deityFormError, setDeityFormError] = useState<string | null>(null);
  const [deityActionLoading, setDeityActionLoading] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [formData.imageUrl]);

  useEffect(() => {
    if (templeToEdit) {
      setFormData({
        name: templeToEdit.name,
        location: templeToEdit.location,
        state: templeToEdit.state || 'Tamil Nadu',
        planets: templeToEdit.planets || [],
        deity: templeToEdit.deity || (deities[0]?.id || 'shivan'),
        significance: templeToEdit.significance || templeToEdit.descriptionTamil || '',
        remedies: templeToEdit.remedies || [],
        imageUrl: templeToEdit.imageUrl || '',
        videoUrl: templeToEdit.videoUrl || '',
        timings: templeToEdit.timings || '',
        history: templeToEdit.history || '',
        poojaDetails: templeToEdit.poojaDetails || '',
        contactNumber: templeToEdit.contactNumber || '',
      });
      // If image is already set, select URL mode by default
      setPhotoMode('url');
    } else {
      setFormData({
        name: '',
        location: '',
        state: 'Tamil Nadu',
        planets: [],
        deity: deities[0]?.id || 'shivan',
        significance: '',
        remedies: [],
        imageUrl: '',
        videoUrl: '',
        timings: '',
        history: '',
        poojaDetails: '',
        contactNumber: '',
      });
      setPhotoMode('url');
    }
    setUploadStatus(null);
    setDeityModalMode('none');
    setDeityFormError(null);
  }, [templeToEdit, isAddEditModalOpen, deities]);

  if (!isAddEditModalOpen) return null;

  const togglePlanet = (planetId: string) => {
    setFormData(prev => ({
      ...prev,
      planets: prev.planets.includes(planetId)
        ? prev.planets.filter(id => id !== planetId)
        : [...prev.planets, planetId],
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    setIsUploadingPhoto(true);
    setUploadStatus(null);
    setImageError(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (!base64) {
        setIsUploadingPhoto(false);
        return;
      }

      try {
        // Attempt upload to Supabase Storage via backend
        const uploadRes = await api.uploadImage(base64, file.name);
        if (uploadRes && uploadRes.url) {
          setFormData(prev => ({ ...prev, imageUrl: uploadRes.url }));
          setUploadStatus(
            uploadRes.source === 'supabase'
              ? 'Uploaded directly to Supabase Storage!'
              : 'Photo loaded successfully!'
          );
        } else {
          // Fallback to local DataURL
          setFormData(prev => ({ ...prev, imageUrl: base64 }));
          setUploadStatus('Photo loaded from local device.');
        }
      } catch {
        setFormData(prev => ({ ...prev, imageUrl: base64 }));
        setUploadStatus('Photo loaded from local device.');
      } finally {
        setIsUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Deity handlers (Admin only)
  const handleSaveNewDeity = async () => {
    if (!deityFormTamil.trim()) {
      setDeityFormError('மூலவர் தமிழ் பெயர் அவசியம் (Tamil deity name is required)');
      return;
    }
    setDeityActionLoading(true);
    setDeityFormError(null);
    try {
      const res = await createDeity({
        nameTamil: deityFormTamil.trim(),
        nameEnglish: deityFormEnglish.trim() || undefined,
      });
      if (res.success && res.deity) {
        setFormData(prev => ({ ...prev, deity: res.deity!.id }));
        setDeityModalMode('none');
        setDeityFormTamil('');
        setDeityFormEnglish('');
      } else {
        setDeityFormError(res.message || 'Failed to add deity');
      }
    } catch (err: any) {
      setDeityFormError(err.message || 'Failed to add deity');
    } finally {
      setDeityActionLoading(false);
    }
  };

  const handleSaveEditDeity = async () => {
    if (!formData.deity) return;
    if (!deityFormTamil.trim()) {
      setDeityFormError('மூலவர் தமிழ் பெயர் அவசியம் (Tamil deity name is required)');
      return;
    }
    setDeityActionLoading(true);
    setDeityFormError(null);
    try {
      const res = await updateDeity(formData.deity, {
        nameTamil: deityFormTamil.trim(),
        nameEnglish: deityFormEnglish.trim() || undefined,
      });
      if (res.success) {
        setDeityModalMode('none');
      } else {
        setDeityFormError(res.message || 'Failed to update deity');
      }
    } catch (err: any) {
      setDeityFormError(err.message || 'Failed to update deity');
    } finally {
      setDeityActionLoading(false);
    }
  };

  const handleDeleteDeity = async () => {
    if (!formData.deity) return;
    const cur = deities.find(d => d.id === formData.deity);
    if (!cur) return;
    if (!window.confirm(`மூலவர் "${cur.nameTamil}" நீக்க விரும்புகிறீர்களா? (Delete deity "${cur.nameTamil}"?)`)) {
      return;
    }
    setDeityActionLoading(true);
    try {
      const res = await deleteDeity(formData.deity);
      if (res.success) {
        const remaining = deities.filter(d => d.id !== formData.deity);
        setFormData(prev => ({ ...prev, deity: remaining[0]?.id || '' }));
        setDeityModalMode('none');
      } else {
        alert(res.message || 'Failed to delete deity');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete deity');
    } finally {
      setDeityActionLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        imageUrl: formData.imageUrl || '',
      };
      await submitTemple(submissionData, templeToEdit?.id);

      const isAdmin = currentUser.role === 'admin';
      setSuccessMessage(
        isAdmin
          ? isEdit
            ? 'Temple updated successfully and published live!'
            : 'New Temple published successfully to live directory and database!'
          : isEdit
          ? 'Temple updates submitted for Review! Contributor reviewers will review and approve your edit.'
          : 'New Temple submitted for Review! It is now listed in the Review tab awaiting approval.'
      );

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(null);
        closeAddEditModal();
        if (isAdmin) {
          setActiveTab('temples');
        } else {
          setActiveTab('review');
        }
      }, 1200);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 ${
      isMobileFrame 
        ? 'items-end sm:items-center p-0 sm:p-4' 
        : 'items-center p-3 sm:p-6'
    }`}>
      <div className={`w-full bg-[#141624] border border-[#2b2f47] shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
        isMobileFrame
          ? 'max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh]'
          : 'max-w-2xl lg:max-w-3xl rounded-3xl max-h-[90vh]'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b border-[#24273c] ${
          isMobileFrame ? 'px-5 py-3.5' : 'px-6 py-4'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-amber-500/20 text-[#f5a623] flex items-center justify-center font-bold">
              🕉️
            </span>
            <div>
              <h2 className={`font-bold text-gray-100 ${isMobileFrame ? 'text-base' : 'text-lg'}`}>
                {isEdit ? 'Edit Temple Details' : 'Add New Temple'}
              </h2>
              <span className="text-[11px] text-amber-400">
                Submitting as {currentUser.name} ({currentUser.role})
              </span>
            </div>
          </div>
          <button
            onClick={closeAddEditModal}
            className="w-8 h-8 rounded-full bg-[#1e2133] text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Check role restriction if user role */}
        {currentUser.role === 'user' ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-100">
              Contributor Role Required to Submit Temples
            </h3>
            <p className="text-sm text-gray-300 max-w-md mx-auto">
              As a registered <strong>User (Viewer)</strong>, you can explore temples and filters. 
              Adding or editing temples requires <strong>Contributor</strong> or <strong>Admin</strong> privileges.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => switchRole('contributor')}
                className="px-5 py-2.5 rounded-xl bg-[#f5a623] text-black font-semibold text-sm hover:bg-[#e69818] shadow-md transition-all cursor-pointer"
              >
                Switch to Contributor (VK) & Continue
              </button>
              <button
                onClick={closeAddEditModal}
                className="px-4 py-2.5 rounded-xl bg-[#202336] text-gray-300 text-sm hover:bg-[#282c44] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Form for Contributor & Admin */
          <form onSubmit={handleSubmit} className={`overflow-y-auto space-y-4 flex-1 no-scrollbar text-sm ${
            isMobileFrame ? 'p-5' : 'p-6'
          }`}>
            {successMessage && (
              <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500 text-emerald-200 flex items-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
            )}

            {/* Temple Name (Always English) */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Temple Name (English) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Angalaparameshwari Temple"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-[#1a1c2d] text-gray-100 px-3.5 py-2.5 rounded-xl border border-[#2d314b] focus:border-[#f5a623] focus:outline-none"
              />
            </div>

            {/* Planets (Grahas) Multi-select */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Associated Planets / Grahas (நவக்கிரகங்கள் - Select all that apply)
              </label>
              <div className={`grid gap-1.5 ${isMobileFrame ? 'grid-cols-3' : 'grid-cols-3 sm:grid-cols-5 md:grid-cols-9'}`}>
                {PLANETS.map(p => {
                  const isSelected = formData.planets.includes(p.id);
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => togglePlanet(p.id)}
                      className={`px-2 py-1.5 rounded-xl text-xs font-tamil font-medium transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'bg-[#f5a623] text-black font-bold ring-2 ring-amber-300'
                          : 'bg-[#1a1c2d] text-gray-300 border border-[#2d314b] hover:border-amber-500/50'
                      }`}
                    >
                      {p.nameTamil}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deity and Timings (Side-by-side in fluid wide, stacked in mobile) */}
            <div className={`grid gap-3.5 ${isMobileFrame ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-300">
                    Primary Deity (மூலவர் / இறைவன் / இறைவி)
                  </label>
                  {currentUser.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeityModalMode('add');
                        setDeityFormTamil('');
                        setDeityFormEnglish('');
                        setDeityFormError(null);
                      }}
                      className="text-[11px] font-semibold text-[#f5a623] hover:text-amber-300 flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
                      title="Add new deity in Tamil (Admin only)"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ மூலவர் சேர்</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={formData.deity}
                    onChange={(e) => setFormData(prev => ({ ...prev, deity: e.target.value }))}
                    className="flex-1 bg-[#1a1c2d] text-gray-100 px-3.5 py-2.5 rounded-xl border border-[#2d314b] focus:border-[#f5a623] focus:outline-none cursor-pointer text-xs sm:text-sm font-tamil"
                  >
                    {deities.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.nameTamil} {d.nameEnglish && d.nameEnglish !== d.nameTamil ? `(${d.nameEnglish})` : ''}
                      </option>
                    ))}
                  </select>

                  {/* Admin Edit & Delete buttons */}
                  {currentUser.role === 'admin' && formData.deity && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const cur = deities.find(d => d.id === formData.deity);
                          if (cur) {
                            setDeityModalMode('edit');
                            setDeityFormTamil(cur.nameTamil);
                            setDeityFormEnglish(cur.nameEnglish || '');
                            setDeityFormError(null);
                          }
                        }}
                        className="p-2.5 rounded-xl bg-[#1e2133] hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 border border-[#2d314b] cursor-pointer transition-all"
                        title="Edit selected deity name in Tamil"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteDeity}
                        className="p-2.5 rounded-xl bg-[#1e2133] hover:bg-rose-500/20 text-gray-300 hover:text-rose-400 border border-[#2d314b] cursor-pointer transition-all"
                        title="Delete selected deity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Inline Deity Add/Edit Panel for Admin */}
                {currentUser.role === 'admin' && deityModalMode !== 'none' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-[#141624] border border-amber-500/40 shadow-xl space-y-2.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-[#24273d] pb-1.5">
                      <span className="text-xs font-bold text-amber-400">
                        {deityModalMode === 'add' ? '➕ புதிய மூலவர் சேர்த்தல் (Add Deity)' : '✏️ மூலவர் திருத்துதல் (Edit Deity)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setDeityModalMode('none');
                          setDeityFormError(null);
                        }}
                        className="text-gray-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {deityFormError && (
                      <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1.5 rounded-lg">
                        {deityFormError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                          மூலவர் பெயர் (தமிழ் / Tamil) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="எ.கா. மாரியம்மன், ஐயனார்"
                          value={deityFormTamil}
                          onChange={(e) => setDeityFormTamil(e.target.value)}
                          className="w-full bg-[#1e2136] text-amber-200 font-tamil text-xs px-2.5 py-2 rounded-lg border border-[#343856] focus:border-[#f5a623] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                          பெயர் ஆங்கிலத்தில் (English)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Mariamman, Ayyanar"
                          value={deityFormEnglish}
                          onChange={(e) => setDeityFormEnglish(e.target.value)}
                          className="w-full bg-[#1e2136] text-gray-200 text-xs px-2.5 py-2 rounded-lg border border-[#343856] focus:border-[#f5a623] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setDeityModalMode('none');
                          setDeityFormError(null);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#222538] text-gray-300 text-xs hover:bg-[#2b2f48] cursor-pointer"
                      >
                        ரத்து (Cancel)
                      </button>
                      <button
                        type="button"
                        disabled={deityActionLoading}
                        onClick={deityModalMode === 'add' ? handleSaveNewDeity : handleSaveEditDeity}
                        className="px-3 py-1 rounded-lg bg-[#f5a623] hover:bg-[#e69818] text-black font-semibold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {deityActionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>{deityModalMode === 'add' ? 'சேமி (Save Deity)' : 'புதுப்பி (Update Deity)'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  தரிசன நேரம் (Timings)
                </label>
                <input
                  type="text"
                  placeholder="காலை 6:00 - 12:30, மாலை 4:00 - இரவு 8:30"
                  value={formData.timings}
                  onChange={(e) => setFormData(prev => ({ ...prev, timings: e.target.value }))}
                  className="w-full bg-[#1a1c2d] text-gray-100 font-tamil text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#2d314b] focus:border-[#f5a623]"
                />
              </div>
            </div>

            {/* Location details (State + Location) */}
            <div className={`grid gap-3.5 ${isMobileFrame ? 'grid-cols-2 gap-2' : 'grid-cols-1 md:grid-cols-2'}`}>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">State</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full bg-[#1a1c2d] text-gray-100 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-[#2d314b] focus:border-[#f5a623] cursor-pointer"
                >
                  {STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Melmalayanoor, Viluppuram"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-[#1a1c2d] text-gray-100 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-[#2d314b] focus:border-[#f5a623]"
                />
              </div>
            </div>

            {/* Significance (Multiline Textbox) */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Significance *
              </label>
              <textarea
                required
                rows={isMobileFrame ? 3 : 4}
                placeholder="Describe the temple significance, historical blessings, and sthala puranam details..."
                value={formData.significance}
                onChange={(e) => setFormData(prev => ({ ...prev, significance: e.target.value }))}
                className="w-full bg-[#1a1c2d] text-gray-100 px-3.5 py-2.5 rounded-xl border border-[#2d314b] focus:border-[#f5a623] focus:outline-none leading-relaxed text-xs sm:text-sm"
              />
            </div>


            {/* Temple Photo: Supabase URL or Device Upload */}
            <div className="bg-[#141624] p-3.5 rounded-2xl border border-[#272b44] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-gray-200">
                    Temple Photo
                  </label>
                  <p className="text-[11px] text-gray-400">
                    Use your Supabase Storage URL or upload directly from your device.
                  </p>
                </div>
                {formData.imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, imageUrl: '' }));
                      setUploadStatus(null);
                    }}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Photo</span>
                  </button>
                )}
              </div>

              {/* Mode Tabs: Supabase / Web URL vs Upload File */}
              <div className="flex items-center gap-2 p-1 bg-[#1b1e30] rounded-xl border border-[#2b304c]">
                <button
                  type="button"
                  onClick={() => setPhotoMode('url')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    photoMode === 'url'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-bold shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Supabase / Image URL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPhotoMode('upload')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    photoMode === 'upload'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-bold shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload from Device</span>
                </button>
              </div>

              {/* TAB 1: Supabase / Image URL Input */}
              {photoMode === 'url' && (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="url"
                      value={formData.imageUrl.startsWith('data:image') ? '' : formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value.trim() }))}
                      placeholder="https://[your-project].supabase.co/storage/v1/object/public/temple-images/temple.jpg"
                      className="w-full bg-[#1b1e30] text-gray-100 text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-[#2f3454] focus:border-[#f5a623] focus:outline-none placeholder-gray-500 font-mono"
                    />
                    <Link2 className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  </div>

                  {/* Supabase URL Detection Badge */}
                  {formData.imageUrl && formData.imageUrl.includes('supabase.co/storage') && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span><strong>Supabase Storage URL verified:</strong> Fast CDN delivery enabled for this temple!</span>
                    </div>
                  )}

                  {/* Helpful Tip */}
                  <div className="p-2.5 bg-[#121422] rounded-xl border border-[#222538] text-[11px] text-gray-400 leading-relaxed flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Supabase Storage Tip:</strong> In your Supabase Dashboard ➔ <strong>Storage</strong> ➔ open bucket (e.g. <code>temple-images</code>), click on your photo, select <strong>"Get public URL"</strong>, and paste it above!
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: Upload File */}
              {photoMode === 'upload' && (
                <div>
                  <label className={`flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed border-[#343856] hover:border-amber-400/80 bg-[#16182a] hover:bg-[#1c1f34] transition-all cursor-pointer p-4 text-center group ${
                    isMobileFrame ? 'h-28' : 'h-32'
                  }`}>
                    {isUploadingPhoto ? (
                      <div className="py-2">
                        <LoadingSpinner
                          size="sm"
                          text="Uploading..."
                          subtext="Uploading to Supabase Storage"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 group-hover:scale-105 flex items-center justify-center transition-all mb-1.5">
                          <Upload className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-200 group-hover:text-amber-300">
                          Select photo from computer / phone
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          Auto-uploaded to Supabase Storage (PNG, JPG, WEBP)
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploadingPhoto}
                      className="hidden"
                    />
                  </label>

                  {uploadStatus && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{uploadStatus}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Photo Preview Card */}
              {formData.imageUrl ? (
                <div className={`mt-2 rounded-xl overflow-hidden border border-[#2d314b] bg-[#101220] ${
                  isMobileFrame ? 'w-full' : 'max-w-md'
                }`}>
                  <div className="aspect-[16/9] w-full bg-black/40 overflow-hidden relative">
                    <img
                      src={formData.imageUrl}
                      alt="Temple preview"
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover"
                    />
                    {imageError && (
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center">
                        <AlertCircle className="w-6 h-6 text-amber-400 mb-1" />
                        <span className="text-xs text-gray-200 font-semibold">Cannot load image preview</span>
                        <span className="text-[10px] text-gray-400 mt-1">
                          Make sure the Supabase bucket is set to <strong>Public</strong> or check the URL.
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 bg-[#161829] border-t border-[#25283d] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {formData.imageUrl.includes('supabase.co/storage')
                          ? 'Supabase Cloud Photo'
                          : formData.imageUrl.startsWith('http')
                          ? 'Web URL Photo'
                          : 'Local Device Photo'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, imageUrl: '' }));
                        setImageError(false);
                      }}
                      className="text-[11px] text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Video Link */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Temple Video URL (YouTube / Video Tour)
              </label>
              <input
                type="text"
                value={formData.videoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-[#1a1c2d] text-gray-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#2d314b] focus:border-[#f5a623]"
              />
            </div>

            {/* Submission / Publish Policy note */}
            {currentUser.role === 'admin' ? (
              <div className="p-3 bg-[#111320] rounded-xl border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Admin Authority:</strong> This temple will be published directly to the live Temples directory and database.
                </span>
              </div>
            ) : (
              <div className="p-3 bg-[#111320] rounded-xl border border-[#24283d] text-xs text-gray-400 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Community Review Policy:</strong> Submissions are queued in the <strong>Review</strong> tab.
                  Contributors and Admins will review details before making it live to all devotees.
                </span>
              </div>
            )}

            {/* Bottom Form Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#24273c]">
              <button
                type="button"
                onClick={closeAddEditModal}
                className="px-4 py-2.5 rounded-xl bg-[#1e2133] text-gray-300 hover:bg-[#272b42] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#f5a623] hover:bg-[#e69818] text-black font-bold shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Saving...'
                    : currentUser.role === 'admin'
                    ? isEdit
                      ? 'Update & Publish (Admin)'
                      : 'Publish Temple Directly (Admin)'
                    : isEdit
                    ? 'Submit Updates for Review'
                    : 'Submit Temple for Review'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
