import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, CheckCircle2, ShieldAlert, Upload, Trash2, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PLANETS, DEITIES, STATES } from '../data/constants';
import { Temple } from '../types';

const DEFAULT_TEMPLE_IMAGE = 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80';

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
  } = useApp();

  const isEdit = !!templeToEdit;

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    state: 'Tamil Nadu',
    planets: [] as string[],
    deity: 'shivan',
    significance: '',
    imageUrl: '',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    timings: 'காலை 6:00 - 12:30, மாலை 4:00 - இரவு 8:30',
    history: '',
    poojaDetails: '',
    contactNumber: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (templeToEdit) {
      setFormData({
        name: templeToEdit.name,
        location: templeToEdit.location,
        state: templeToEdit.state || 'Tamil Nadu',
        planets: templeToEdit.planets || [],
        deity: templeToEdit.deity || 'shivan',
        significance: templeToEdit.significance || templeToEdit.descriptionTamil || '',
        imageUrl: templeToEdit.imageUrl || DEFAULT_TEMPLE_IMAGE,
        videoUrl: templeToEdit.videoUrl || '',
        timings: templeToEdit.timings || '',
        history: templeToEdit.history || '',
        poojaDetails: templeToEdit.poojaDetails || '',
        contactNumber: templeToEdit.contactNumber || '',
      });
    } else {
      setFormData({
        name: '',
        location: '',
        state: 'Tamil Nadu',
        planets: ['sani'],
        deity: 'amman',
        significance: '',
        imageUrl: '',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        timings: 'காலை 6:00 - 12:30, மாலை 4:00 - இரவு 8:30',
        history: '',
        poojaDetails: '',
        contactNumber: '',
      });
    }
  }, [templeToEdit, isAddEditModalOpen]);

  if (!isAddEditModalOpen) return null;

  const togglePlanet = (planetId: string) => {
    setFormData(prev => ({
      ...prev,
      planets: prev.planets.includes(planetId)
        ? prev.planets.filter(id => id !== planetId)
        : [...prev.planets, planetId],
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormData(prev => ({ ...prev, imageUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        imageUrl: formData.imageUrl || DEFAULT_TEMPLE_IMAGE,
      };
      await submitTemple(submissionData, templeToEdit?.id);
      setSuccessMessage(
        isEdit
          ? 'Temple updates submitted for Review! Contributor reviewers will review and approve your edit.'
          : 'New Temple submitted for Review! It is now listed in the Review tab awaiting approval.'
      );

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(null);
        closeAddEditModal();
        setActiveTab('review');
      }, 1400);
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
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Primary Deity (இறைவன் / இறைவி)
                </label>
                <select
                  value={formData.deity}
                  onChange={(e) => setFormData(prev => ({ ...prev, deity: e.target.value }))}
                  className="w-full bg-[#1a1c2d] text-gray-100 px-3.5 py-2.5 rounded-xl border border-[#2d314b] focus:border-[#f5a623] focus:outline-none cursor-pointer"
                >
                  {DEITIES.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.nameTamil} ({d.nameEnglish})
                    </option>
                  ))}
                </select>
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
                placeholder="Describe the temple significance, remedies, historical blessings, and pariharam details..."
                value={formData.significance}
                onChange={(e) => setFormData(prev => ({ ...prev, significance: e.target.value }))}
                className="w-full bg-[#1a1c2d] text-gray-100 px-3.5 py-2.5 rounded-xl border border-[#2d314b] focus:border-[#f5a623] focus:outline-none leading-relaxed text-xs sm:text-sm"
              />
            </div>

            {/* Temple Photo: Upload from Computer */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Temple Photo
                </label>
                {formData.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {formData.imageUrl ? (
                /* Uploaded Image Preview */
                <div className={`relative rounded-2xl overflow-hidden border border-[#2d314b] bg-[#101220] ${
                  isMobileFrame ? 'w-full' : 'max-w-md'
                }`}>
                  <div className="aspect-[16/9] w-full bg-black/40 overflow-hidden">
                    <img
                      src={formData.imageUrl}
                      alt="Uploaded temple preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2.5 bg-[#161829] border-t border-[#25283d] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Photo selected</span>
                    </div>

                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#23263d] hover:bg-[#2d314e] text-xs font-semibold text-amber-400 hover:text-amber-300 border border-amber-500/30 transition-colors cursor-pointer">
                      <RefreshCw className="w-3 h-3" />
                      <span>Change Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                /* Upload Button / Dropzone */
                <label className={`flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed border-[#343856] hover:border-amber-400/80 bg-[#16182a] hover:bg-[#1c1f34] transition-all cursor-pointer p-4 text-center group ${
                  isMobileFrame ? 'h-32' : 'h-36'
                }`}>
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 group-hover:scale-105 flex items-center justify-center transition-all mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-200 group-hover:text-amber-300">
                    Upload from computer
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                    Click to select PNG, JPG, or WEBP photo from your device
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
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

            {/* Submission note */}
            <div className="p-3 bg-[#111320] rounded-xl border border-[#24283d] text-xs text-gray-400 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Community Review Policy:</strong> Submissions are queued in the <strong>Review</strong> tab.
                Contributors and Admins will review details before making it live to all devotees.
              </span>
            </div>

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
                <span>{isSubmitting ? 'Submitting...' : isEdit ? 'Submit Updates for Review' : 'Submit Temple for Review'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
