import React, { useState } from 'react';
import {
  X,
  KeyRound,
  Lock,
  User,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LoadingSpinner } from './LoadingSpinner';

export const ChangePasswordModal: React.FC = () => {
  const {
    isChangePasswordModalOpen,
    closeChangePasswordModal,
    changePassword,
    currentUser,
    isLoggedIn,
    isMobileFrame,
  } = useApp();

  const [identifier, setIdentifier] = useState(() => {
    try {
      return localStorage.getItem('mupporul_saved_identifier') || '';
    } catch {
      return '';
    }
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isChangePasswordModalOpen) return null;

  const handleReset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const targetUser = !isLoggedIn ? identifier.trim() : (currentUser?.username || currentUser?.id);
    if (!targetUser) {
      setErrorMsg('Please enter your username or email.');
      return;
    }

    if (!currentPassword.trim()) {
      setErrorMsg('Please enter your current password.');
      return;
    }

    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    if (newPassword.trim() === currentPassword.trim()) {
      setErrorMsg('New password cannot be the same as your current password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changePassword(currentPassword, newPassword, !isLoggedIn ? identifier.trim() : undefined);
      if (!res.success) {
        setErrorMsg(res.message);
        setIsSubmitting(false);
      } else {
        setSuccessMsg(res.message);
        setIsSubmitting(false);
        setTimeout(() => {
          handleReset();
          closeChangePasswordModal();
        }, 1800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to change password');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-md bg-[#131524] rounded-3xl border border-[#272b42] shadow-2xl overflow-hidden flex flex-col ${isMobileFrame ? 'max-w-[360px]' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#22253a]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100">Change Password</h2>
              <p className="text-[11px] text-gray-400">
                {isLoggedIn && currentUser ? (
                  <>Update password for <span className="text-amber-400 font-mono">@{currentUser.username || currentUser.name}</span></>
                ) : (
                  <>Reset or update password for your account</>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleReset();
              closeChangePasswordModal();
            }}
            className="w-8 h-8 rounded-full bg-[#1b1e2f] text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2.5 shadow-md">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username / Email field (only if not logged in) */}
            {!isLoggedIn && (
              <div>
                <label className="block text-gray-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Username or Email *</span>
                </label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Enter your username or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#181a29] border border-[#282d45] rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            )}

            {/* Current Password */}
            <div>
              <label className="block text-gray-300 font-bold mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Current Password *</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#181a29] border border-[#282d45] rounded-xl px-3.5 py-2.5 pr-10 text-sm font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-gray-300 font-bold mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>New Password *</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  placeholder="At least 4 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#181a29] border border-[#282d45] rounded-xl px-3.5 py-2.5 pr-10 text-sm font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-gray-300 font-bold mb-1.5 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>Confirm New Password *</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-[#181a29] border rounded-xl px-3.5 py-2.5 pr-10 text-sm font-mono text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-500/60 focus:border-red-500'
                      : 'border-[#282d45] focus:border-amber-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  closeChangePasswordModal();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#1a1c2d] text-gray-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-1.5">
                    <LoadingSpinner size="xs" text="" color="#000000" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-black" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
