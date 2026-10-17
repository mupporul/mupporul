import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Shield,
  Lock,
  Mail,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  Copy,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';

export const AddUserModal: React.FC = () => {
  const {
    isAddUserModalOpen,
    closeAddUserModal,
    addUser,
    currentUser,
    isMobileFrame,
  } = useApp();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('contributor');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    username: string;
    password: string;
    role: Role;
    name: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isAddUserModalOpen) return null;

  // Safeguard: Only admin can use this
  if (currentUser.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-md bg-[#131524] rounded-3xl border border-red-500/40 p-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-gray-100">Admin Privilege Required</h3>
          <p className="text-sm text-gray-400">
            Only administrators can add or delete system users. Please switch to the Admin role to continue.
          </p>
          <button
            onClick={closeAddUserModal}
            className="px-5 py-2.5 rounded-xl bg-[#1d2136] text-gray-200 text-sm font-semibold hover:bg-[#282d49]"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleGeneratePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const genPw = `temple#${rand}`;
    setPassword(genPw);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    if (!cleanUsername) {
      setErrorMsg('Please enter a valid username (letters, numbers, underscores).');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Please enter the user\'s full name.');
      return;
    }

    if (!password.trim() || password.trim().length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addUser({
        name: name.trim(),
        username: cleanUsername,
        password: password.trim(),
        email: email.trim() || undefined,
        role,
      });

      if (!res.success) {
        setErrorMsg(res.message);
        setIsSubmitting(false);
      } else {
        setSuccessData({
          name: name.trim(),
          username: cleanUsername,
          password: password.trim(),
          role,
        });
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create user');
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!successData) return;
    const text = `Mupporul App Login Credentials:\nName: ${successData.name}\nUsername: ${successData.username}\nPassword: ${successData.password}\nRole: ${successData.role.toUpperCase()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetForm = () => {
    setName('');
    setUsername('');
    setPassword('');
    setEmail('');
    setRole('contributor');
    setErrorMsg(null);
    setSuccessData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-lg bg-[#131524] rounded-3xl border border-[#272b42] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isMobileFrame ? 'max-w-[360px]' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#22253a]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-900/40 border border-purple-500/40 text-purple-300 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-100">Add New User</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-600/40 uppercase">
                  Admin Only
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Create login credentials and assign role</p>
            </div>
          </div>

          <button
            onClick={() => {
              handleResetForm();
              closeAddUserModal();
            }}
            className="w-8 h-8 rounded-full bg-[#1b1e2f] text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {successData ? (
            /* Success confirmation card with copy option */
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#0e111d] border border-emerald-500/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-100">User Created Successfully!</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    The user account is now active and ready to log in immediately.
                  </p>
                </div>

                {/* Credentials summary box */}
                <div className="p-3.5 rounded-xl bg-[#161828] border border-[#262a42] text-left text-xs space-y-2 mt-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#21243a]">
                    <span className="text-gray-400">Full Name:</span>
                    <span className="font-semibold text-gray-200">{successData.name}</span>
                  </div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#21243a]">
                    <span className="text-gray-400">Username:</span>
                    <span className="font-mono font-bold text-amber-400">@{successData.username}</span>
                  </div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#21243a]">
                    <span className="text-gray-400">Password:</span>
                    <span className="font-mono font-semibold text-gray-200">{successData.password}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Assigned Role:</span>
                    <span className="font-bold text-purple-300 uppercase text-[11px]">
                      {successData.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleCopyCredentials}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
                  </button>

                  <button
                    onClick={handleResetForm}
                    className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#1b1e32] hover:bg-[#252a44] border border-[#2b304c] text-gray-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Add Another</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  handleResetForm();
                  closeAddUserModal();
                }}
                className="w-full py-2.5 rounded-xl bg-[#1a1c2d] text-gray-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sivakumar Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#181a29] border border-[#282d45] rounded-xl px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-mono font-bold">@</span>
                    <span>Username *</span>
                  </span>
                  <span className="text-[11px] text-gray-400">Used for login</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sivasharma"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                  className="w-full bg-[#181a29] border border-[#282d45] rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Password *</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-generate</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 4 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#181a29] border border-[#282d45] rounded-xl px-3.5 py-2.5 pr-10 text-sm font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>Email Address (Optional)</span>
                  </span>
                  <span className="text-[11px] text-gray-500">Defaults to @mupporul.app</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. siva@temple.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#181a29] border border-[#282d45] rounded-xl px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  <span>Assign Role (RBAC) *</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* User Role */}
                  <label
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      role === 'user'
                        ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'bg-[#181a29] border-[#292d44] hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="userRole"
                      value="user"
                      checked={role === 'user'}
                      onChange={() => setRole('user')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300">User</span>
                      {role === 'user' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                      Viewer only. Explores temples & bookmarks.
                    </p>
                  </label>

                  {/* Contributor Role */}
                  <label
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      role === 'contributor'
                        ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
                        : 'bg-[#181a29] border-[#292d44] hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="userRole"
                      value="contributor"
                      checked={role === 'contributor'}
                      onChange={() => setRole('contributor')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">Contributor</span>
                      {role === 'contributor' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                      Can submit new temples & review edits.
                    </p>
                  </label>

                  {/* Admin Role */}
                  <label
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      role === 'admin'
                        ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30'
                        : 'bg-[#181a29] border-[#292d44] hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="userRole"
                      value="admin"
                      checked={role === 'admin'}
                      onChange={() => setRole('admin')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300">Admin</span>
                      {role === 'admin' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                      Full access, user management & analytics.
                    </p>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <UserPlus className="w-4 h-4 text-black" />
                  )}
                  <span>{isSubmitting ? 'Creating User...' : 'Create User & Generate Credentials'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
