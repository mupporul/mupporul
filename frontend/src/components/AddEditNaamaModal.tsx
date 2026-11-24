import React, { useEffect, useState } from 'react';
import { X, Save, Check, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PLANETS } from '../data/constants';

export const AddEditNaamaModal: React.FC = () => {
  const {
    isNaamaModalOpen,
    naamaToEdit,
    closeNaamaModal,
    createNaamaVilakkam,
    updateNaamaVilakkam,
    currentUser,
  } = useApp();

  const [nameTamil, setNameTamil] = useState('');
  const [selectedPlanets, setSelectedPlanets] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canEdit = currentUser.role === 'admin' || currentUser.role === 'contributor' || currentUser.role === 'user';

  useEffect(() => {
    if (!isNaamaModalOpen) return;
    if (naamaToEdit) {
      setNameTamil(naamaToEdit.nameTamil || '');
      setSelectedPlanets(Array.isArray(naamaToEdit.planets) ? [...naamaToEdit.planets] : []);
      setNotes(naamaToEdit.notes || '');
    } else {
      setNameTamil('');
      setSelectedPlanets([]);
      setNotes('');
    }
    setErrorMsg(null);
    setSaving(false);
  }, [isNaamaModalOpen, naamaToEdit]);

  if (!isNaamaModalOpen || !canEdit) return null;

  const togglePlanet = (planetId: string) => {
    setSelectedPlanets(prev =>
      prev.includes(planetId) ? prev.filter(p => p !== planetId) : [...prev, planetId]
    );
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameTamil.trim();
    if (selectedPlanets.length === 0) {
      setErrorMsg('குறைந்தது ஒரு கிரகத்தைத் தேர்ந்தெடுக்கவும்.');
      return;
    }
    if (!trimmedName) {
      setErrorMsg('நாமம் (தமிழ்) அவசியம்.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      const res = naamaToEdit
        ? await updateNaamaVilakkam(naamaToEdit.id, {
            nameTamil: trimmedName,
            planets: selectedPlanets,
            notes: notes.trim(),
          })
        : await createNaamaVilakkam({
            nameTamil: trimmedName,
            planets: selectedPlanets,
            notes: notes.trim(),
          });

      if (res.success) {
        closeNaamaModal();
      } else {
        setErrorMsg(res.message || 'சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.');
      }
    } finally {
      setSaving(false);
    }
  };

  const selectedPlanetObjects = PLANETS.filter(p => selectedPlanets.includes(p.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="naama-modal-title"
    >
      <div className="w-full max-w-lg max-h-[92dvh] flex flex-col bg-[#121420] rounded-3xl border border-[#282c44] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#22263d] shrink-0">
          <div>
            <h3
              id="naama-modal-title"
              className="text-base sm:text-lg font-bold text-amber-300 font-tamil"
            >
              {naamaToEdit ? 'நாம விளக்கம் திருத்துக' : 'புதிய நாம விளக்கம் சேர்க்க'}
            </h3>
            <p className="text-xs text-gray-400 font-tamil mt-0.5">
              1 அல்லது கூட்டுக் கிரகங்களுடன் தமிழ் நாமம் சேமிக்கவும்
            </p>
          </div>
          <button
            type="button"
            onClick={closeNaamaModal}
            aria-label="Close modal"
            className="min-w-[44px] min-h-[44px] rounded-xl bg-[#1a1d2e] text-gray-400 hover:text-white flex items-center justify-center border border-[#2c304a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-300 font-tamil">
              {errorMsg}
            </div>
          )}

          {/* 1. 9 Planets Single or Combo Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-200 font-tamil">
                கிரகங்கள் (1 அல்லது கூட்டுத் தேர்வு) *
              </label>
              {selectedPlanets.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedPlanets([])}
                  className="text-xs text-amber-400 hover:text-amber-300 font-tamil cursor-pointer"
                >
                  அனைத்தையும் நீக்கு
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {PLANETS.map(planet => {
                const isSelected = selectedPlanets.includes(planet.id);
                return (
                  <button
                    key={planet.id}
                    type="button"
                    onClick={() => togglePlanet(planet.id)}
                    aria-pressed={isSelected}
                    className={`min-h-[44px] px-3 py-2 rounded-xl border text-sm font-tamil font-semibold flex items-center justify-between gap-2 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400 ${
                      isSelected
                        ? 'bg-amber-500/15 border-[#f5a623] text-amber-200 shadow-sm'
                        : 'bg-[#171a2b] border-[#262a42] text-gray-300 hover:border-[#3c4266] hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: planet.color }}
                      />
                      <span className="truncate">{planet.nameTamil}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#f5a623] shrink-0 stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            {selectedPlanetObjects.length > 0 && (
              <div className="pt-1 text-xs text-gray-300 font-tamil flex flex-wrap items-center gap-1.5">
                <span className="text-gray-400">தேர்ந்தெடுத்த சேர்க்கை:</span>
                <span className="font-semibold text-amber-300">
                  {selectedPlanetObjects.map(p => p.nameTamil).join(' + ')}
                </span>
              </div>
            )}
          </div>

          {/* 2. Tamil Name Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="naama-name-tamil"
              className="block text-xs sm:text-sm font-semibold text-gray-200 font-tamil"
            >
              நாமம் / பெயர் (தமிழ் மட்டும்) *
            </label>
            <input
              id="naama-name-tamil"
              type="text"
              value={nameTamil}
              onChange={(e) => {
                setNameTamil(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="எ.கா. பார்த்தசாரதி"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#171a2b] border border-[#2d324e] focus:border-[#f5a623] focus:outline-none text-sm sm:text-base text-gray-100 font-tamil placeholder:text-gray-500"
              required
            />
          </div>

          {/* 3. Optional Tamil Note Box Underneath */}
          <div className="space-y-1.5">
            <label
              htmlFor="naama-notes-tamil"
              className="block text-xs sm:text-sm font-semibold text-gray-200 font-tamil"
            >
              குறிப்பு (தேவைப்பட்டால் மட்டும்)
            </label>
            <textarea
              id="naama-notes-tamil"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="கூடுதல் விளக்கம் அல்லது ஜோதிடக் குறிப்பு..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#171a2b] border border-[#2d324e] focus:border-[#f5a623] focus:outline-none text-sm text-gray-100 font-tamil placeholder:text-gray-500 resize-y"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#22263d]">
            <button
              type="button"
              onClick={closeNaamaModal}
              disabled={saving}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1a1d2e] hover:bg-[#23273d] text-gray-300 text-xs sm:text-sm font-semibold font-tamil transition-colors cursor-pointer"
            >
              ரத்து
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#f5a623] hover:bg-[#e69818] text-black text-xs sm:text-sm font-bold font-tamil flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{naamaToEdit ? 'புதுப்பி' : 'சேமி'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
