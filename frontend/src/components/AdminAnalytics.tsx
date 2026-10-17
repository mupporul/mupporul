import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  ShieldCheck,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Database,
  UserPlus,
  Trash2,
  Lock,
  X,
  KeyRound,
  RefreshCw,
  Download,
  AlertCircle,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PLANETS, DEITIES } from '../data/constants';
import { Role, UserProfile } from '../types';

export const AdminAnalytics: React.FC = () => {
  const {
    temples,
    submissions,
    users,
    updateUserRole,
    currentUser,
    switchRole,
    openAddModal,
    openAddUserModal,
    deleteUser,
    clearAllTemples,
    resetToDefaultData,
    setActiveTab,
  } = useApp();

  const [filterUserRole, setFilterUserRole] = useState<'all' | Role>('all');
  const [roleUpdatedMsg, setRoleUpdatedMsg] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});


  const totalTemples = temples.length;
  const pendingReviews = submissions.filter(s => s.status === 'pending').length;
  const approvedReviews = submissions.filter(s => s.status === 'approved').length;
  const rejectedReviews = submissions.filter(s => s.status === 'rejected').length;
  const totalSubmissions = submissions.length;
  const approvalRate =
    totalSubmissions > 0
      ? Math.round((approvedReviews / (approvedReviews + rejectedReviews || 1)) * 100)
      : 100;

  const totalViews = temples.reduce((acc, t) => acc + (t.viewsCount || 0), 0);
  const activeContributors = users.filter(u => u.role === 'contributor' || u.role === 'admin').length;

  // Planet distribution
  const planetDistribution = PLANETS.map(p => {
    const count = temples.filter(t => t.planets.includes(p.id)).length;
    return {
      ...p,
      count,
      pct: totalTemples > 0 ? Math.round((count / totalTemples) * 100) : 0,
    };
  }).sort((a, b) => b.count - a.count);

  // Deity distribution
  const deityDistribution = DEITIES.map(d => {
    const count = temples.filter(t => t.deity === d.id).length;
    return {
      ...d,
      count,
      pct: totalTemples > 0 ? Math.round((count / totalTemples) * 100) : 0,
    };
  }).sort((a, b) => b.count - a.count);

  const handleRoleChange = (userId: string, newRole: Role) => {
    updateUserRole(userId, newRole);
    const targetUser = users.find(u => u.id === userId);
    setRoleUpdatedMsg(`Updated ${targetUser?.name || 'User'} role to ${newRole.toUpperCase()} successfully.`);
    setTimeout(() => setRoleUpdatedMsg(null), 3000);
  };

  const handleExportData = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      temples,
      submissions,
      users,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mupporul-database-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = filterUserRole === 'all'
    ? users
    : users.filter(u => u.role === filterUserRole);

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-7">
      {/* Admin Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#22253a]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-900/40 border border-purple-500/40 text-purple-300">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-100">
              Admin & Governance Dashboard
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            System metrics, Navagraha catalog distribution, community review approval rates, and RBAC user management.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f5a623] hover:bg-[#e69818] text-black font-semibold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Temple</span>
          </button>

          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a1d2e] border border-[#2e334d] text-gray-300 hover:text-white text-xs font-medium transition-colors"
            title="Download full JSON database backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>
        </div>
      </div>

      {/* Role Notice banner if not admin */}
      {currentUser.role !== 'admin' && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-purple-300 font-semibold block text-sm">
                Viewing Admin Analytics in Preview Mode
              </strong>
              <p className="opacity-90">
                You are currently logged in as <strong>{currentUser.name}</strong> ({currentUser.role}). 
                Switch to Admin Murugan to manage user roles and direct admin controls.
              </p>
            </div>
          </div>
          <button
            onClick={() => switchRole('admin')}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            Switch to Admin Role
          </button>
        </div>
      )}

      {/* Notification Toast */}
      {roleUpdatedMsg && (
        <div className="p-3.5 rounded-xl bg-purple-950/80 border border-purple-500 text-purple-200 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-purple-400" />
          <span>{roleUpdatedMsg}</span>
        </div>
      )}

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Temples */}
        <div className="p-4 rounded-2xl bg-[#141626] border border-[#262a42] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Total Temples</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-100">{totalTemples}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Live catalog
            </div>
          </div>
        </div>

        {/* Card 2: Pending Reviews */}
        <div 
          onClick={() => setActiveTab('review')}
          className="p-4 rounded-2xl bg-[#141626] border border-[#262a42] hover:border-amber-500/50 shadow-sm flex flex-col justify-between cursor-pointer group transition-colors"
        >
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-400">{pendingReviews}</div>
            <div className="text-[11px] text-gray-400 group-hover:text-amber-300 mt-1 flex items-center gap-1">
              Review queue →
            </div>
          </div>
        </div>

        {/* Card 3: Approved Submissions */}
        <div className="p-4 rounded-2xl bg-[#141626] border border-[#262a42] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Approval Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-400">{approvalRate}%</div>
            <div className="text-[11px] text-gray-400 mt-1">
              {approvedReviews} approved / {rejectedReviews} rejected
            </div>
          </div>
        </div>

        {/* Card 4: Total Platform Views */}
        <div className="p-4 rounded-2xl bg-[#141626] border border-[#262a42] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Total Views</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-blue-400">
              {totalViews.toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              {activeContributors} contributors
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Navagraha Distribution & Deity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Navagraha Planetary Distribution */}
        <div className="p-5 rounded-2xl bg-[#141626] border border-[#262a42] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Temples by Navagraha (Planets)</span>
            </h3>
            <span className="text-xs text-gray-400">Distribution</span>
          </div>

          <div className="space-y-2.5">
            {planetDistribution.map(p => (
              <div key={p.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-tamil">
                    <span className="font-bold text-[#f5a623]">{p.nameTamil}</span>
                    <span className="text-gray-400 font-sans text-[11px]">
                      ({p.nameEnglish.split(' ')[0]})
                    </span>
                  </div>
                  <span className="text-gray-300 font-semibold">{p.count} temples</span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-2 rounded-full bg-[#1e2236] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(p.pct, 4)}%`,
                      backgroundColor: p.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deity Distribution */}
        <div className="p-5 rounded-2xl bg-[#141626] border border-[#262a42] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
              <span>🕉️</span>
              <span>Temples by Primary Deity</span>
            </h3>
            <span className="text-xs text-gray-400">Distribution</span>
          </div>

          <div className="space-y-2.5">
            {deityDistribution.map(d => (
              <div key={d.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-tamil">
                    <span className="font-bold text-gray-200">{d.nameTamil}</span>
                    <span className="text-gray-400 font-sans text-[11px]">
                      ({d.nameEnglish.split(' ')[0]})
                    </span>
                  </div>
                  <span className="text-gray-300 font-semibold">{d.count} temples</span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-2 rounded-full bg-[#1e2236] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-700 transition-all duration-500"
                    style={{
                      width: `${Math.max(d.pct, 4)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) User Management Table */}
      <div className="p-5 rounded-2xl bg-[#141626] border border-[#262a42] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>User Management & RBAC Permissions</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Admin controls: Add new users with custom username & password, assign roles, or delete users.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-[#0e101c] p-1 rounded-xl border border-[#24283f] text-xs">
              {(['all', 'user', 'contributor', 'admin'] as const).map(roleKey => (
                <button
                  key={roleKey}
                  onClick={() => setFilterUserRole(roleKey)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                    filterUserRole === roleKey
                      ? 'bg-[#22263d] text-amber-300 font-semibold'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {roleKey}
                </button>
              ))}
            </div>

            {/* Add User Button (Admin Only) */}
            {currentUser.role === 'admin' && (
              <button
                onClick={openAddUserModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-black" />
                <span>Add User</span>
              </button>
            )}
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#24283f] text-gray-400">
                <th className="py-2.5 px-3">User & Login</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Password</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Contributions</th>
                <th className="py-2.5 px-3 text-right">Actions (Role & Delete)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2236]">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-[#1a1c2d] transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${u.avatarColor} text-white font-bold text-xs flex items-center justify-center`}>
                        {u.avatarText}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-200">{u.name}</span>
                          {u.id === currentUser.id && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-amber-400/90 block">@{u.username}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-gray-400">{u.email}</td>

                  {/* Password Column with show/hide toggle */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 font-mono text-gray-300">
                      <span>{visiblePasswords[u.id] ? (u.password || '••••••') : '••••••••'}</span>
                      {u.password && (
                        <button
                          type="button"
                          onClick={() => setVisiblePasswords(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                          className="text-gray-500 hover:text-gray-300 transition-colors p-0.5 cursor-pointer"
                          title={visiblePasswords[u.id] ? 'Hide password' : 'Show password'}
                        >
                          {visiblePasswords[u.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border capitalize ${
                        u.role === 'admin'
                          ? 'bg-purple-950/60 text-purple-300 border-purple-600/40'
                          : u.role === 'contributor'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-600/40'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-gray-300">
                    <span className="font-semibold">{u.contributionsCount || 0}</span>
                    <span className="text-gray-500 text-[11px] ml-1">
                      ({u.approvedCount || 0} approved)
                    </span>
                  </td>

                  {/* Actions Column: Change Role + Delete */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        className="bg-[#121422] text-gray-200 border border-[#2b304c] rounded-xl px-2.5 py-1 text-xs focus:border-[#f5a623] cursor-pointer"
                      >
                        <option value="user">User (Viewer)</option>
                        <option value="contributor">Contributor (Add/Review)</option>
                        <option value="admin">Admin (Full RBAC)</option>
                      </select>

                      {/* Delete User Button (Disabled for active logged-in user) */}
                      {u.id !== currentUser.id ? (
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-500/30 transition-all cursor-pointer"
                          title={`Delete user @${u.username}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-500 italic px-1.5 py-0.5">Active</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#131524] rounded-3xl border border-red-500/40 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-red-400">
                <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-100">Delete User Account</h3>
                  <p className="text-[11px] text-gray-400">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setUserToDelete(null)}
                className="w-7 h-7 rounded-full bg-[#1b1e2f] text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0e101c] border border-[#24283f] space-y-2 text-xs">
              <p className="text-gray-300">
                Are you sure you want to permanently delete user <strong className="text-amber-400">@{userToDelete.username}</strong> ({userToDelete.name})?
              </p>
              <div className="text-[11px] text-gray-400 flex items-center gap-2">
                <span>Role: <strong className="text-purple-300 uppercase">{userToDelete.role}</strong></span>
                <span>•</span>
                <span>Email: {userToDelete.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl bg-[#1b1e32] text-gray-300 text-xs font-semibold hover:bg-[#252a44] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeleteLoading(true);
                  const res = await deleteUser(userToDelete.id);
                  setDeleteLoading(false);
                  setUserToDelete(null);
                  if (res.success) {
                    setRoleUpdatedMsg(res.message);
                    setTimeout(() => setRoleUpdatedMsg(null), 3000);
                  } else {
                    alert(res.message);
                  }
                }}
                disabled={deleteLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteLoading ? 'Deleting...' : 'Confirm Delete User'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Maintenance & Clear Options */}
      <div className="space-y-4">
        {/* Supabase Status Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#141829] to-[#121c2c] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Supabase Integration Ready
              </h4>
            </div>
            <p className="text-xs text-gray-300">
              Run <code className="bg-[#1c223a] text-cyan-200 px-1.5 py-0.5 rounded text-[11px]">supabase-schema.sql</code> in your Supabase SQL editor, then add <code className="bg-[#1c223a] text-amber-200 px-1.5 py-0.5 rounded text-[11px]">SUPABASE_URL</code> and <code className="bg-[#1c223a] text-amber-200 px-1.5 py-0.5 rounded text-[11px]">SUPABASE_KEY</code> to Render Environment.
            </p>
          </div>
        </div>

        {/* Clear All Temples Card */}
        <div className="p-5 rounded-2xl bg-[#141626] border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge & Remove All Temples</span>
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Wipe out all demo/sample temples so you can start with a 100% clean catalog for your team's real data or Supabase sync.
            </p>
          </div>

          <button
            onClick={async () => {
              const confirmPurge = window.confirm(
                '⚠️ Are you sure you want to remove ALL temples from the database?\n\nThis will clear the entire temple catalog to 0 temples so you can start clean.'
              );
              if (confirmPurge) {
                setClearLoading(true);
                await clearAllTemples();
                setClearLoading(false);
                setRoleUpdatedMsg('All temples have been successfully removed! Catalog is now clean.');
                setTimeout(() => setRoleUpdatedMsg(null), 4000);
              }
            }}
            disabled={clearLoading}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            {clearLoading ? 'Clearing Temples...' : 'Wipe All Temples (0 Temples)'}
          </button>
        </div>

        {/* System Maintenance & Seed Reset */}
        <div className="p-5 rounded-2xl bg-[#141626] border border-[#262a42] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Restore Demo / Sample Temples</span>
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Want the original 8 sample temples back? Restore default seed data anytime.
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm('Restore default sample temples and contributors?')) {
                resetToDefaultData();
                setRoleUpdatedMsg('Default demo temples restored.');
                setTimeout(() => setRoleUpdatedMsg(null), 3000);
              }
            }}
            className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            Restore Demo Data
          </button>
        </div>
      </div>
    </div>
  );
};
