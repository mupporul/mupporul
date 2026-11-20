import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, AlertCircle, CheckCircle2, Tags } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SolutionTag } from '../types';

interface AdminSolutionTagsPanelProps {
  compact?: boolean;
  onClose?: () => void;
}

export const AdminSolutionTagsPanel: React.FC<AdminSolutionTagsPanelProps> = ({
  compact = false,
  onClose,
}) => {
  const {
    currentUser,
    solutionTags,
    temples,
    createSolutionTag,
    updateSolutionTag,
    deleteSolutionTag,
  } = useApp();

  const [newTamil, setNewTamil] = useState('');
  const [newEnglish, setNewEnglish] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTamil, setEditTamil] = useState('');
  const [editEnglish, setEditEnglish] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (currentUser.role !== 'admin') {
    return null;
  }

  const getTagUsageCount = (tagId: string) =>
    temples.filter(t => Array.isArray(t.solutionTags) && t.solutionTags.includes(tagId)).length;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTamil.trim()) {
      setStatusMsg({ type: 'error', text: 'பிரச்சனை குறிச்சொல் (தமிழ்) அவசியம்.' });
      return;
    }
    setSubmitting(true);
    setStatusMsg(null);
    const res = await createSolutionTag({
      nameTamil: newTamil.trim(),
      nameEnglish: newEnglish.trim(),
    });
    setSubmitting(false);
    if (res.success) {
      setNewTamil('');
      setNewEnglish('');
      setStatusMsg({ type: 'success', text: res.message || 'Tag added.' });
      setTimeout(() => setStatusMsg(null), 3500);
    } else {
      setStatusMsg({ type: 'error', text: res.message || 'Failed to add tag.' });
    }
  };

  const startEdit = (tag: SolutionTag) => {
    setEditingId(tag.id);
    setEditTamil(tag.nameTamil);
    setEditEnglish(tag.nameEnglish || '');
    setConfirmDeleteId(null);
    setStatusMsg(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTamil.trim()) {
      setStatusMsg({ type: 'error', text: 'பிரச்சனை குறிச்சொல் (தமிழ்) காலியாக இருக்கக் கூடாது.' });
      return;
    }
    setSubmitting(true);
    const res = await updateSolutionTag(id, {
      nameTamil: editTamil.trim(),
      nameEnglish: editEnglish.trim(),
    });
    setSubmitting(false);
    if (res.success) {
      setEditingId(null);
      setStatusMsg({ type: 'success', text: res.message || 'Tag updated.' });
      setTimeout(() => setStatusMsg(null), 3500);
    } else {
      setStatusMsg({ type: 'error', text: res.message || 'Failed to update tag.' });
    }
  };

  const handleDelete = async (id: string) => {
    setSubmitting(true);
    const res = await deleteSolutionTag(id);
    setSubmitting(false);
    setConfirmDeleteId(null);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Tag removed.' });
      setTimeout(() => setStatusMsg(null), 3500);
    } else {
      setStatusMsg({ type: 'error', text: res.message || 'Failed to remove tag.' });
    }
  };

  return (
    <div className={compact ? 'space-y-4' : 'rounded-2xl bg-[#141624] border border-[#25283f] p-5 space-y-4'}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[#f5a623] flex items-center justify-center shrink-0">
            <Tags className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-100">
              Admin Solution Tags Configuration
            </h3>
            <p className="text-xs text-gray-400 font-tamil">
              பிரச்சனை / தீர்வு குறிச்சொற்கள் ({solutionTags.length})
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tag configuration"
            className="w-8 h-8 rounded-full bg-[#1e2236] hover:bg-[#2a2f4a] text-gray-300 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {statusMsg && (
        <div
          role="status"
          className={`px-3.5 py-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="font-tamil">{statusMsg.text}</span>
        </div>
      )}

      {/* Add New Problem Tag Form */}
      <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
        <div className="sm:col-span-5">
          <label className="block text-[11px] font-semibold text-gray-300 mb-1 font-tamil">
            பிரச்சனை குறிச்சொல் (தமிழ்) *
          </label>
          <input
            type="text"
            value={newTamil}
            onChange={(e) => setNewTamil(e.target.value)}
            placeholder="எ.கா. திருமண தடை, கடன் தீர"
            className="w-full bg-[#1a1c2d] text-gray-100 font-tamil text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-[#2d314b] focus:border-[#f5a623] focus:outline-none"
          />
        </div>
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold text-gray-300 mb-1">
            English Label (Optional)
          </label>
          <input
            type="text"
            value={newEnglish}
            onChange={(e) => setNewEnglish(e.target.value)}
            placeholder="e.g. Marriage Delay"
            className="w-full bg-[#1a1c2d] text-gray-100 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-[#2d314b] focus:border-[#f5a623] focus:outline-none"
          />
        </div>
        <div className="sm:col-span-3">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#f5a623] hover:bg-[#e69818] text-black text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Tag</span>
          </button>
        </div>
      </form>

      {/* Configured Tags List */}
      <div className="border border-[#23273d] rounded-xl divide-y divide-[#202438] bg-[#10121e] max-h-72 overflow-y-auto">
        {solutionTags.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-400">
            No problem tags configured yet. Add the first tag above.
          </div>
        ) : (
          solutionTags.map((tag) => {
            const isEditing = editingId === tag.id;
            const isConfirmingDelete = confirmDeleteId === tag.id;
            const count = getTagUsageCount(tag.id);

            return (
              <div
                key={tag.id}
                className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#16192a] transition-colors"
              >
                {isEditing ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editTamil}
                      onChange={(e) => setEditTamil(e.target.value)}
                      aria-label="Edit tag Tamil name"
                      className="w-full bg-[#1d2033] text-gray-100 font-tamil text-xs px-2.5 py-1.5 rounded-lg border border-[#f5a623] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editEnglish}
                      onChange={(e) => setEditEnglish(e.target.value)}
                      placeholder="English label (optional)"
                      aria-label="Edit tag English label"
                      className="w-full bg-[#1d2033] text-gray-200 text-xs px-2.5 py-1.5 rounded-lg border border-[#2f3454] focus:border-[#f5a623] focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="min-w-0 flex items-center gap-2 text-xs">
                    <span className="font-tamil font-semibold text-gray-100 truncate">
                      {tag.nameTamil}
                    </span>
                    {tag.nameEnglish && (
                      <>
                        <span className="text-gray-600" aria-hidden="true">·</span>
                        <span className="text-gray-400 truncate">{tag.nameEnglish}</span>
                      </>
                    )}
                    <span className="text-gray-600" aria-hidden="true">·</span>
                    <span className="text-[11px] text-amber-400/90 font-mono tabular-nums whitespace-nowrap">
                      {count} {count === 1 ? 'temple' : 'temples'}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleSaveEdit(tag.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#22263b] hover:bg-[#2c314c] text-gray-300 text-[11px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  ) : isConfirmingDelete ? (
                    <>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleDelete(tag.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#22263b] hover:bg-[#2c314c] text-gray-300 text-[11px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(tag)}
                        aria-label={`Edit ${tag.nameTamil}`}
                        title="Edit tag"
                        className="p-1.5 rounded-lg bg-[#1c2032] hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 border border-[#2b3048] cursor-pointer transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDeleteId(tag.id);
                          setEditingId(null);
                        }}
                        aria-label={`Delete ${tag.nameTamil}`}
                        title="Delete tag"
                        className="p-1.5 rounded-lg bg-[#1c2032] hover:bg-rose-500/20 text-gray-300 hover:text-rose-400 border border-[#2b3048] cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
