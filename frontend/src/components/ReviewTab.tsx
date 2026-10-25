import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  History,
  FileCheck2,
  ExternalLink,
  RotateCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TempleSubmission } from '../types';
import { PLANETS, DEITIES } from '../data/constants';

export const ReviewTab: React.FC = () => {
  const {
    submissions,
    approveSubmission,
    rejectSubmission,
    currentUser,
    switchRole,
    setActiveTab,
    openDetailModal,
    temples,
    deities,
    refreshFreshData,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [approvingNotes, setApprovingNotes] = useState<Record<string, string>>({});
  const [showApprovalFeedback, setShowApprovalFeedback] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Always fetch fresh submissions from backend when opening or switching to Review tab
  useEffect(() => {
    refreshFreshData();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFreshData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const isUserRole = currentUser.role === 'user';
  const canReview = currentUser.role === 'contributor' || currentUser.role === 'admin';

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected');

  const currentList =
    activeSubTab === 'pending'
      ? pendingSubmissions
      : activeSubTab === 'approved'
      ? approvedSubmissions
      : rejectedSubmissions;

  const handleApprove = async (submission: TempleSubmission) => {
    const notes = approvingNotes[submission.id] || 'Verified and approved for publication.';
    await approveSubmission(submission.id, notes);
    await refreshFreshData();
    setShowApprovalFeedback(`"${submission.templeData?.name || 'Temple'}" has been approved and moved to the Temples section!`);
    setTimeout(() => setShowApprovalFeedback(null), 3500);
  };

  const handleRejectSubmit = async (submissionId: string) => {
    if (!rejectNotes.trim()) return;
    await rejectSubmission(submissionId, rejectNotes);
    await refreshFreshData();
    setRejectingId(null);
    setRejectNotes('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 space-y-6">
      {/* Tab Header & Explainer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#212437]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-[#f5a623]">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-100">
              Community Review Queue
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Submissions must be vetted and approved by <strong>Contributors</strong> or <strong>Admins</strong> before going live.
          </p>
        </div>

        {/* Current Reviewer Status Pill & Refresh Queue Button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c1f30] hover:bg-[#25293d] border border-[#2f334d] text-gray-300 text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh submissions queue directly from database"
          >
            <RotateCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <span className="text-xs text-gray-400 hidden xs:inline">Reviewer:</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1c1f30] border border-[#2f334d] text-amber-300">
            {currentUser.name} ({currentUser.role})
          </span>
        </div>
      </div>

      {/* Role Notice for Standard Users */}
      {isUserRole && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="text-amber-300 font-semibold text-sm block">
                User Role: Read-Only Review Access
              </strong>
              <p className="text-amber-200/90 leading-relaxed">
                As per role-based access control, standard Users can view temples and filters. 
                Only <strong>Contributors</strong> and <strong>Admins</strong> have approval and rejection rights.
              </p>
            </div>
          </div>
          <button
            onClick={() => switchRole('contributor')}
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-[#f5a623] text-black font-bold text-xs hover:bg-[#e69818] shadow-md transition-all cursor-pointer"
          >
            Switch to Contributor (VK)
          </button>
        </div>
      )}

      {/* Approval Success Notification Toast */}
      {showApprovalFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 flex items-center justify-between gap-3 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{showApprovalFeedback}</span>
          </div>
          <button
            onClick={() => setActiveTab('temples')}
            className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-500/30 flex items-center gap-1"
          >
            <span>View Temples</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Sub Tabs: Pending (count) | Approved | Rejected */}
      <div className="flex items-center gap-2 p-1 bg-[#121422] rounded-2xl border border-[#22253a]">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'pending'
              ? 'bg-[#1e2238] text-amber-400 shadow-sm border border-amber-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Review</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            pendingSubmissions.length > 0 ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-400'
          }`}>
            {pendingSubmissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('approved')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'approved'
              ? 'bg-[#1e2238] text-emerald-400 shadow-sm border border-emerald-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Approved ({approvedSubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rejected')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'rejected'
              ? 'bg-[#1e2238] text-red-400 shadow-sm border border-red-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Rejected ({rejectedSubmissions.length})</span>
        </button>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-[#141624] border border-[#22253a] space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-800/80 text-gray-400 flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-200">
              No {activeSubTab} submissions at this moment
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {activeSubTab === 'pending'
                ? 'All pending submissions have been reviewed! New contributor submissions will appear here.'
                : `No submissions have been marked as ${activeSubTab} yet.`}
            </p>
          </div>
        ) : (
          currentList.map((sub) => {
            const isPending = sub.status === 'pending';
            const templeName = sub.templeData?.name || 'Unnamed Temple';
            const templeLocation = sub.templeData?.location || 'Tamil Nadu';
            const submitterName = sub.submittedBy?.name || 'Contributor';
            const submitterRole = sub.submittedBy?.role || 'contributor';
            const initials = (submitterName.slice(0, 2) || 'CT').toUpperCase();
            const planetsList = Array.isArray(sub.templeData?.planets) ? sub.templeData.planets : [];
            const deityId = sub.templeData?.deity;
            const deityObj = deities?.find(d => d.id === deityId) || DEITIES.find(d => d.id === deityId);
            const liveTemple = sub.templeId
              ? temples.find(t => t.id === sub.templeId)
              : temples.find(t => t.name.trim().toLowerCase() === templeName.trim().toLowerCase());

            return (
              <div
                key={sub.id}
                className="rounded-2xl bg-[#151726] border border-[#262a40] p-4 sm:p-5 shadow-lg space-y-4"
              >
                {/* Top Submitter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#212437] text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 text-white font-bold text-xs flex items-center justify-center">
                      {initials}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-200">{submitterName}</span>
                      <span className="text-[10px] text-gray-400 ml-1.5">({submitterRole})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-[11px]">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Recent'}
                    </span>

                    {/* Submission Type Badge */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        sub.type === 'new'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                          : 'bg-blue-950 text-blue-300 border border-blue-600/40'
                      }`}
                    >
                      {sub.type === 'new' ? '+ New Temple' : '✎ Edit Submission'}
                    </span>
                  </div>
                </div>

                {/* Main Content Layout (No image thumbnail to save free tier bandwidth) */}
                <div className="space-y-2.5">
                  <div>
                    <h4 className="text-base font-bold text-gray-100">
                      {templeName}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      📍 {templeLocation}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {planetsList.map(pId => {
                      const planet = PLANETS.find(p => p.id === pId);
                      return planet ? (
                        <span
                          key={planet.id}
                          className="px-2 py-0.5 rounded-full text-xs font-tamil text-[#f5a623] bg-[#1a1c29] border border-[#f5a623]/60"
                        >
                          {planet.nameTamil}
                        </span>
                      ) : null;
                    })}

                    {deityObj && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-tamil text-gray-300 bg-[#1e2236] border border-[#343852]">
                        {deityObj.nameTamil}
                      </span>
                    )}
                  </div>

                  {/* Significance */}
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                    {sub.templeData?.significance || sub.templeData?.descriptionTamil || ''}
                  </p>

                  {/* Timings */}
                  <p className="text-[11px] text-gray-400 font-tamil">
                    🕒 <span className="text-amber-400/90">தரிசன நேரம்:</span> {sub.templeData?.timings || 'காலை & மாலை'}
                  </p>
                </div>

                {/* Edit Diff Highlight Section (If submission is an edit) */}
                {sub.type === 'edit' && sub.previousData && (
                  <div className="p-3 rounded-xl bg-[#0f111d] border border-[#24273d] text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-400 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Comparison with Previous Version:</span>
                    </div>

                    {sub.previousData.significance !== sub.templeData.significance && (
                      <div className="space-y-1">
                        <div className="text-red-400/90 line-through text-[11px]">
                          - Old Significance: {sub.previousData.significance}
                        </div>
                        <div className="text-emerald-400 text-[11px]">
                          + New Significance: {sub.templeData.significance}
                        </div>
                      </div>
                    )}

                    {sub.previousData.timings !== sub.templeData.timings && sub.previousData.timings && (
                      <div className="space-y-1 font-tamil">
                        <div className="text-red-400/90 line-through text-[11px]">
                          - Old Timings: {sub.previousData.timings}
                        </div>
                        <div className="text-emerald-400 text-[11px]">
                          + New Timings: {sub.templeData.timings}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviewer Notes (If already approved/rejected) */}
                {sub.status !== 'pending' && (
                  <div className={`p-3 rounded-xl border text-xs ${
                    sub.status === 'approved'
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-red-950/30 border-red-500/40 text-red-200'
                  }`}>
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span>Reviewed by {sub.reviewedBy?.name} ({sub.reviewedBy?.role}):</span>
                      <span className="text-[11px] opacity-75">
                        {sub.reviewedAt && new Date(sub.reviewedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="italic">{sub.reviewNotes || 'No notes specified.'}</p>

                    {sub.status === 'approved' && liveTemple && (
                      <button
                        onClick={() => openDetailModal(liveTemple)}
                        className="mt-2 text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> View live temple listing
                      </button>
                    )}
                  </div>
                )}

                {/* Review Actions for Pending Items */}
                {isPending && (
                  <div className="pt-2 border-t border-[#212437]">
                    {rejectingId === sub.id ? (
                      /* Reject Form */
                      <div className="space-y-2 p-3 bg-[#1e1317] rounded-xl border border-red-500/40 animate-in fade-in">
                        <label className="block text-xs font-semibold text-red-300">
                          Provide reason for rejection (required):
                        </label>
                        <textarea
                          rows={2}
                          value={rejectNotes}
                          onChange={(e) => setRejectNotes(e.target.value)}
                          placeholder="e.g. Needs more authentic pariharam details or duplicate location..."
                          className="w-full bg-[#130b0e] text-gray-200 text-xs p-2.5 rounded-lg border border-red-500/50 focus:outline-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectNotes('');
                            }}
                            className="px-3 py-1.5 text-xs text-gray-300 hover:bg-[#2b171e] rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRejectSubmit(sub.id)}
                            disabled={!rejectNotes.trim()}
                            className="px-4 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                          >
                            Confirm Rejection
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Action Buttons */
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 max-w-sm">
                          <input
                            type="text"
                            placeholder="Optional reviewer notes / approval comment..."
                            value={approvingNotes[sub.id] || ''}
                            onChange={(e) =>
                              setApprovingNotes(prev => ({ ...prev, [sub.id]: e.target.value }))
                            }
                            disabled={!canReview}
                            className="w-full bg-[#121422] text-gray-300 text-xs px-3 py-2 rounded-xl border border-[#2b2f47] focus:border-amber-400 focus:outline-none disabled:opacity-50"
                          />
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            disabled={!canReview}
                            onClick={() => setRejectingId(sub.id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-950/40 text-red-300 border border-red-500/40 hover:bg-red-900/40 disabled:opacity-40 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>

                          <button
                            disabled={!canReview}
                            onClick={() => handleApprove(sub)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 disabled:opacity-40 transition-all cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve & Publish</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
