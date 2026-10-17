import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    closeLoginModal,
    loginWithCredentials,
    users,
    currentUser,
    setActiveTab,
  } = useApp();

  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = loginWithCredentials(identifier, password);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setSuccessMsg(null);
        if (identifier.toLowerCase().includes('admin')) {
          setActiveTab('analytics');
        }
      }, 1000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickLogin = (uname: string, pw: string) => {
    setIdentifier(uname);
    setPassword(pw);
    setErrorMsg(null);
    const res = loginWithCredentials(uname, pw);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setSuccessMsg(null);
        if (uname === 'admin') {
          setActiveTab('analytics');
        }
      }, 900);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#131524] rounded-3xl border border-[#272b42] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#22253a]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-900/40 border border-purple-500/40 text-purple-300 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100">User & Admin Login</h2>
              <p className="text-[11px] text-gray-400">Role-Based Access Control</p>
            </div>
          </div>

          <button
            onClick={closeLoginModal}
            className="w-8 h-8 rounded-full bg-[#1b1e2f] text-gray-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Default Credentials Cheat Sheet (Prominent Box) */}
          <div className="p-4 rounded-2xl bg-[#0e101d] border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Default Login Credentials</span>
              </span>
              <span className="text-[10px] text-gray-500">Click to fill</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {/* Admin */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="w-full p-2 rounded-xl bg-[#17192a] hover:bg-[#20233b] border border-[#2b304d] hover:border-purple-500 flex items-center justify-between text-left transition-all group cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-600/40 text-[10px] font-bold">
                      ADMIN
                    </span>
                    <span className="font-semibold text-gray-200">Username: <code className="text-amber-300">admin</code></span>
                  </div>
                  <span className="text-[11px] text-gray-400">Password: <code className="text-gray-300">admin123</code></span>
                </div>
                <span className="text-[11px] text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Log in →
                </span>
              </button>

              {/* Contributor */}
              <button
                type="button"
                onClick={() => handleQuickLogin('vk', 'contributor123')}
                className="w-full p-2 rounded-xl bg-[#17192a] hover:bg-[#20233b] border border-[#2b304d] hover:border-amber-500 flex items-center justify-between text-left transition-all group cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-600/40 text-[10px] font-bold">
                      CONTRIBUTOR
                    </span>
                    <span className="font-semibold text-gray-200">Username: <code className="text-amber-300">vk</code></span>
                  </div>
                  <span className="text-[11px] text-gray-400">Password: <code className="text-gray-300">contributor123</code></span>
                </div>
                <span className="text-[11px] text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Log in →
                </span>
              </button>

              {/* User / Viewer */}
              <button
                type="button"
                onClick={() => handleQuickLogin('devotee', 'user123')}
                className="w-full p-2 rounded-xl bg-[#17192a] hover:bg-[#20233b] border border-[#2b304d] hover:border-emerald-500 flex items-center justify-between text-left transition-all group cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/40 text-[10px] font-bold">
                      USER
                    </span>
                    <span className="font-semibold text-gray-200">Username: <code className="text-amber-300">devotee</code></span>
                  </div>
                  <span className="text-[11px] text-gray-400">Password: <code className="text-gray-300">user123</code></span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Log in →
                </span>
              </button>
            </div>

            {/* Custom Admin-Created Users (if any exist) */}
            {users.filter(u => !['user-admin', 'user-vk', 'user-devotee'].includes(u.id)).length > 0 && (
              <div className="pt-2.5 mt-2 border-t border-[#23273e] space-y-1.5">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  Custom Created Users (by Admin)
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                  {users
                    .filter(u => !['user-admin', 'user-vk', 'user-devotee'].includes(u.id))
                    .map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleQuickLogin(u.username, u.password || '')}
                        className="w-full p-2 rounded-xl bg-[#17192a] hover:bg-[#20233b] border border-[#2b304d] hover:border-amber-500/60 flex items-center justify-between text-left transition-all group cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-purple-950/70 text-purple-300 border border-purple-600/40 text-[10px] font-bold uppercase">
                              {u.role}
                            </span>
                            <span className="font-semibold text-gray-200">@{u.username}</span>
                            <span className="text-gray-400 text-[11px]">({u.name})</span>
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono">Password: {u.password || '••••••'}</span>
                        </div>
                        <span className="text-[11px] text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                          Log in →
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin or admin@mupporul.app"
                  className="w-full bg-[#17192a] text-gray-100 pl-9 pr-3 py-2.5 rounded-xl border border-[#2b304c] focus:border-[#f5a623] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full bg-[#17192a] text-gray-100 pl-9 pr-10 py-2.5 rounded-xl border border-[#2b304c] focus:border-[#f5a623] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#f5a623] hover:bg-[#e69818] text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Sign In as {identifier.toLowerCase().includes('admin') ? 'Admin' : identifier.toLowerCase().includes('vk') ? 'Contributor' : 'User'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Current login status */}
          <div className="pt-2 border-t border-[#1f2235] flex items-center justify-between text-[11px] text-gray-400">
            <span>Currently active:</span>
            <span className="font-semibold text-amber-300">
              {currentUser.name} ({currentUser.role.toUpperCase()})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
