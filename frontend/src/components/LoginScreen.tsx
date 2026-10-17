import React, { useState } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Compass,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginScreen: React.FC = () => {
  const {
    loginWithCredentials,
    users,
    setIsLoggedIn,
    setActiveTab,
    isMobileFrame,
  } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Please enter your username or email.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginWithCredentials(identifier, password);
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          if (identifier.toLowerCase().includes('admin')) {
            setActiveTab('analytics');
          } else {
            setActiveTab('temples');
          }
        }, 800);
      } else {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  const handleQuickLogin = (uname: string, pw: string) => {
    setIdentifier(uname);
    setPassword(pw);
    setErrorMsg(null);
    setIsLoading(true);
    setTimeout(() => {
      const res = loginWithCredentials(uname, pw);
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          if (uname.toLowerCase().includes('admin')) {
            setActiveTab('analytics');
          } else {
            setActiveTab('temples');
          }
        }, 800);
      }
    }, 300);
  };

  const handleContinueAsGuest = () => {
    setIsLoggedIn(true);
    setActiveTab('temples');
  };

  const customUsers = users.filter(u => !['user-admin', 'user-vk', 'user-devotee'].includes(u.id));

  return (
    <div className="min-h-screen w-full bg-[#080a12] text-gray-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Sacred ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-amber-500/10 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className={`w-full max-w-md relative z-10 space-y-6 ${isMobileFrame ? 'max-w-[360px]' : ''}`}>
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-xl shadow-amber-500/20 text-black font-extrabold text-2xl border border-amber-300/40">
            🕉️
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            முப்பொருள் • Mupporul
          </h1>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Navagraha Parihara Sthalangal & Hindu Temples of Tamil Nadu
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#121424] rounded-3xl border border-[#262940] shadow-2xl p-6 sm:p-7 space-y-5 backdrop-blur-md">
          <div className="border-b border-[#212439] pb-4">
            <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <span>User Login</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Sign in with your username and password to contribute, review, and bookmark temples.
            </p>

            {/* Note clarifying that no registration is needed */}
            <div className="mt-2.5 p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-2 text-[11px] text-purple-300">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span>User accounts are provisioned by Administrators.</span>
            </div>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2.5 shadow-md animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username / Email */}
            <div>
              <label className="block text-gray-300 font-bold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Username or Email *</span>
                </span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. admin, vk, devotee"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-[#181a29] border border-[#282d45] rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 font-bold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password *</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#181a29] border border-[#282d45] rounded-xl px-3.5 py-2.5 pr-10 text-sm font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 text-black" />
              )}
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick Login Helper Box */}
          <div className="p-3.5 rounded-2xl bg-[#0c0e1a] border border-[#23273e] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Quick-Select Credentials</span>
              </span>
              <span className="text-[10px] text-gray-500">1-click test</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-2 rounded-xl bg-[#17192a] hover:bg-[#20233b] border border-purple-500/40 text-left transition-all cursor-pointer"
              >
                <span className="text-[10px] font-bold text-purple-300 block">ADMIN</span>
                <span className="text-[11px] font-mono text-gray-200">admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('vk', 'contributor123')}
                className="p-2 rounded-xl bg-[#17192a] hover:bg-[#20233b] border border-amber-500/40 text-left transition-all cursor-pointer"
              >
                <span className="text-[10px] font-bold text-amber-300 block">CONTRIBUTOR</span>
                <span className="text-[11px] font-mono text-gray-200">vk</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('devotee', 'user123')}
                className="p-2 rounded-xl bg-[#17192a] hover:bg-[#20233b] border border-emerald-500/40 text-left transition-all cursor-pointer"
              >
                <span className="text-[10px] font-bold text-emerald-300 block">USER</span>
                <span className="text-[11px] font-mono text-gray-200">devotee</span>
              </button>
            </div>

            {/* Custom Created Users if any exist */}
            {customUsers.length > 0 && (
              <div className="pt-2 border-t border-[#1c1f33] space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold block">
                  Custom Accounts Created by Admin:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {customUsers.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u.username, u.password || '')}
                      className="px-2 py-1 rounded-lg bg-[#181b2f] hover:bg-[#242948] border border-[#2b304c] text-[11px] text-gray-200 flex items-center gap-1 cursor-pointer"
                    >
                      <span className="font-mono text-amber-300">@{u.username}</span>
                      <span className="text-gray-400 text-[10px]">({u.role})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Guest browsing alternative */}
          <div className="pt-1 text-center">
            <button
              onClick={handleContinueAsGuest}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Browse Temples as Guest (பார்வையாளர்) →</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-gray-500">
          Mupporul Web Application • Free Tier Architecture • 100% Client-Side Ready
        </p>
      </div>
    </div>
  );
};
