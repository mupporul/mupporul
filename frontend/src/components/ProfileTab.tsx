import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Bookmark,
  CheckCircle,
  FileCheck2,
  Sparkles,
  ExternalLink,
  PlusCircle,
  Clock,
  Eye,
  LogOut,
  RefreshCw,
  KeyRound,
  Layers,
  UserPlus,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';

export const ProfileTab: React.FC = () => {
  const {
    currentUser,
    switchRole,
    temples,
    submissions,
    bookmarkedIds,
    openDetailModal,
    openAddModal,
    openAddUserModal,
    openChangePasswordModal,
    logout,
    setActiveTab,
    resetToDefaultData,
    openLoginModal,
    setIsArchitectureModalOpen,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'bookmarks' | 'my_submissions' | 'roles_info'>('bookmarks');

  const myBookmarkedTemples = temples.filter(t => bookmarkedIds.includes(t.id));
  const mySubmissions = submissions.filter(s => s.submittedBy.id === currentUser.id);

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin (Full Privileges)', color: 'bg-purple-900/60 text-purple-300 border-purple-500/40' };
      case 'contributor':
        return { label: 'Contributor (Add / Edit / Review)', color: 'bg-amber-900/60 text-amber-300 border-amber-500/40' };
      case 'user':
        return { label: 'User (Viewer Only)', color: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40' };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header Card */}
      <div className="rounded-3xl bg-[#141624] border border-[#25283f] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${currentUser.avatarColor} text-white font-extrabold text-xl flex items-center justify-center ring-2 ring-amber-500/40 shadow-lg`}>
              {currentUser.avatarText}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-100">{currentUser.name}</h2>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{currentUser.email}</p>

              <div className="flex items-center gap-4 mt-2 text-xs text-gray-300">
                <span>
                  <strong className="text-amber-400">{myBookmarkedTemples.length}</strong> Saved Temples
                </span>
                <span>•</span>
                <span>
                  <strong className="text-emerald-400">{currentUser.contributionsCount || 0}</strong> Contributions
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {currentUser.role !== 'user' && (
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f5a623] hover:bg-[#e69818] text-black font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Temple</span>
              </button>
            )}

            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={openAddUserModal}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-900/50 border border-purple-500/50 text-purple-200 text-xs font-semibold hover:bg-purple-900/70 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-purple-300" />
                  <span>Add User</span>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-900/30 border border-purple-500/40 text-purple-300 text-xs font-semibold hover:bg-purple-900/50 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Users & Stats</span>
                </button>
              </>
            )}

            <button
              onClick={openChangePasswordModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1b1e32] border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-[#252a44] transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Password</span>
            </button>

            <button
              onClick={openLoginModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#17192a] border border-[#2b304c] text-gray-300 hover:text-white text-xs font-semibold hover:bg-[#22253d] transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span>Switch User</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/40 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Log Out</span>
            </button>

            <button
              onClick={() => setIsArchitectureModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#131627] border border-[#2b2f48] text-gray-300 hover:text-amber-300 hover:border-amber-500/40 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Free Tier Setup</span>
            </button>
          </div>
        </div>

        {/* 3-Role Switcher Demo (Directly Addresses User Request) */}
        <div className="mt-6 pt-5 border-t border-[#22253a]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Role-Based Access Control (RBAC) Switcher:</span>
            </span>
            <span className="text-[11px] text-amber-400">Click to test each role</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* User Button */}
            <button
              onClick={() => switchRole('user')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                currentUser.role === 'user'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                  : 'bg-[#181a29] border-[#292d44] text-gray-400 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs">
                <span>Role: User</span>
                {currentUser.role === 'user' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <p className="text-[11px] mt-1 opacity-80 leading-tight">
                Can only view temples and use filters. Cannot add, edit, or approve.
              </p>
            </button>

            {/* Contributor Button */}
            <button
              onClick={() => switchRole('contributor')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                currentUser.role === 'contributor'
                  ? 'bg-amber-950/40 border-amber-500 text-amber-200 ring-2 ring-amber-500/30'
                  : 'bg-[#181a29] border-[#292d44] text-gray-400 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs">
                <span>Role: Contributor</span>
                {currentUser.role === 'contributor' && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <p className="text-[11px] mt-1 opacity-80 leading-tight">
                Can add, edit, submit temples, and review / approve pending submissions.
              </p>
            </button>

            {/* Admin Button */}
            <button
              onClick={() => switchRole('admin')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                currentUser.role === 'admin'
                  ? 'bg-purple-950/40 border-purple-500 text-purple-200 ring-2 ring-purple-500/30'
                  : 'bg-[#181a29] border-[#292d44] text-gray-400 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs">
                <span>Role: Admin</span>
                {currentUser.role === 'admin' && <CheckCircle className="w-3.5 h-3.5 text-purple-400" />}
              </div>
              <p className="text-[11px] mt-1 opacity-80 leading-tight">
                Full governance, Dashboard Analytics, and manage user roles.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Account Credentials & Password Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141624] border border-[#25283f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-100">Account Credentials & Security</h3>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                @{currentUser.username || currentUser.name}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Change your password anytime to protect your temple contributions and bookmarks.
            </p>
          </div>
        </div>

        <button
          onClick={openChangePasswordModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-md"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Change Password</span>
        </button>
      </div>

      {/* Tabs: My Saved | My Submissions | Roles Guide */}
      <div className="flex items-center gap-2 p-1 bg-[#121422] rounded-2xl border border-[#22253a]">
        <button
          onClick={() => setActiveSubTab('bookmarks')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'bookmarks'
              ? 'bg-[#1e2238] text-amber-400 shadow-sm border border-amber-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Temples ({myBookmarkedTemples.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('my_submissions')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'my_submissions'
              ? 'bg-[#1e2238] text-amber-400 shadow-sm border border-amber-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>My Submissions ({mySubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('roles_info')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'roles_info'
              ? 'bg-[#1e2238] text-amber-400 shadow-sm border border-amber-500/30'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>RBAC Matrix</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeSubTab === 'bookmarks' && (
        <div className="space-y-3">
          {myBookmarkedTemples.length === 0 ? (
            <div className="text-center py-10 rounded-3xl bg-[#141624] border border-[#22253a] space-y-2">
              <Bookmark className="w-10 h-10 text-gray-500 mx-auto" />
              <h4 className="text-sm font-semibold text-gray-200">No saved temples yet</h4>
              <p className="text-xs text-gray-400">
                Click the bookmark icon or 3-dots menu on any temple card to save it for quick pilgrimage access.
              </p>
            </div>
          ) : (
            myBookmarkedTemples.map(temple => (
              <div
                key={temple.id}
                className="p-3.5 rounded-2xl bg-[#141624] border border-[#25283f] flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={temple.imageUrl}
                    alt={temple.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-100">{temple.name}</h4>
                    <span className="text-[11px] text-gray-400">{temple.location}</span>
                  </div>
                </div>

                <button
                  onClick={() => openDetailModal(temple)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold cursor-pointer"
                >
                  View Details →
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeSubTab === 'my_submissions' && (
        <div className="space-y-3">
          {mySubmissions.length === 0 ? (
            <div className="text-center py-10 rounded-3xl bg-[#141624] border border-[#22253a] space-y-3">
              <FileCheck2 className="w-10 h-10 text-gray-500 mx-auto" />
              <h4 className="text-sm font-semibold text-gray-200">No submissions found</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {currentUser.role === 'user'
                  ? 'Standard users can view temples. Switch to Contributor role to add new temples into the review queue!'
                  : 'You have not submitted any temples yet. Click "Add Temple" to submit your first temple!'}
              </p>
              {currentUser.role !== 'user' && (
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 rounded-xl bg-[#f5a623] text-black font-bold text-xs"
                >
                  + Submit a Temple Now
                </button>
              )}
            </div>
          ) : (
            mySubmissions.map(sub => (
              <div
                key={sub.id}
                className="p-4 rounded-2xl bg-[#141624] border border-[#25283f] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-100">{sub.templeData.name}</h4>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        sub.status === 'approved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                          : sub.status === 'pending'
                          ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                          : 'bg-red-950 text-red-300 border border-red-600/40'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted on {new Date(sub.submittedAt).toLocaleDateString()} • Type: {sub.type}
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('review')}
                  className="text-xs text-amber-400 hover:underline font-medium"
                >
                  View in Review Tab →
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeSubTab === 'roles_info' && (
        <div className="p-5 rounded-3xl bg-[#141624] border border-[#25283f] space-y-4 text-xs">
          <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Role-Based Access Control (RBAC) Specification</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-[#181a29] border border-[#2a2e46] space-y-1">
              <strong className="text-emerald-400 font-semibold block text-sm">
                1. Role: User (Viewer)
              </strong>
              <p className="text-gray-300 leading-relaxed">
                • Can search and view temples, details, pariharams, and videos.<br />
                • Can filter temples by Graha (planet), deity, state, and significance.<br />
                • <strong>Restriction:</strong> Cannot add temples, edit temples, or review/approve submissions.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#181a29] border border-[#2a2e46] space-y-1">
              <strong className="text-amber-400 font-semibold block text-sm">
                2. Role: Contributor
              </strong>
              <p className="text-gray-300 leading-relaxed">
                • Can add new temples and edit existing temples.<br />
                • Submissions are submitted into the community <strong>Review</strong> tab.<br />
                • All contributors can approve or reject submissions before they go live.<br />
                • Once approved, it clears from review and moves to live temples!
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#181a29] border border-[#2a2e46] space-y-1">
              <strong className="text-purple-400 font-semibold block text-sm">
                3. Role: Admin
              </strong>
              <p className="text-gray-300 leading-relaxed">
                • Full governance over all temples and submissions.<br />
                • Access to <strong>Dashboard Analytics</strong> (metrics, charts, approval rates, distribution).<br />
                • Dynamic RBAC management: promote/demote users between User, Contributor, and Admin.<br />
                • Database backup export & seed data reset.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
