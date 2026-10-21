import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    closeLoginModal,
    loginWithCredentials,
    setActiveTab,
    openChangePasswordModal,
  } = useApp();

  const [rememberPassword, setRememberPassword] = useState(() => {
    try {
      return localStorage.getItem('mupporul_remember_me') === 'true';
    } catch {
      return false;
    }
  });

  const [identifier, setIdentifier] = useState(() => {
    try {
      return localStorage.getItem('mupporul_saved_identifier') || '';
    } catch {
      return '';
    }
  });

  const [password, setPassword] = useState(() => {
    try {
      if (localStorage.getItem('mupporul_remember_me') === 'true') {
        return localStorage.getItem('mupporul_saved_password') || '';
      }
    } catch {}
    return '';
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
    try {
      const res = await loginWithCredentials(identifier.trim(), password);
      setIsLoading(false);
      if (res.success) {
        if (rememberPassword) {
          try {
            localStorage.setItem('mupporul_remember_me', 'true');
            localStorage.setItem('mupporul_saved_identifier', identifier.trim());
            localStorage.setItem('mupporul_saved_password', password.trim());
          } catch {}
        } else {
          try {
            localStorage.removeItem('mupporul_remember_me');
            localStorage.removeItem('mupporul_saved_password');
          } catch {}
        }

        setSuccessMsg(res.message);
        setTimeout(() => {
          setSuccessMsg(null);
          closeLoginModal();
          if (identifier.toLowerCase().includes('admin')) {
            setActiveTab('analytics');
          }
        }, 500);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
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
              <h2 className="text-lg font-bold text-gray-100">User Login</h2>
              <p className="text-[11px] text-gray-400">Sign in with your registered account</p>
            </div>
          </div>

          <button
            onClick={closeLoginModal}
            className="w-8 h-8 rounded-full bg-[#1b1e2f] text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
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

          {/* Form */}
          <form id="modal-login-form" name="modalLogin" onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username / Email */}
            <div>
              <label htmlFor="modal-login-username" className="block text-gray-300 font-bold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Username or Email *</span>
                </span>
              </label>
              <input
                id="modal-login-username"
                name="username"
                type="text"
                required
                autoComplete="username"
                placeholder="Enter username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-[#181a29] border border-[#282d45] rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="modal-login-password" className="block text-gray-300 font-bold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password *</span>
                </span>
              </label>
              <div className="relative">
                <input
                  id="modal-login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter password"
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

            {/* Options: Remember/Save Password & Change Password */}
            <div className="flex items-center justify-between text-xs pt-1 pb-1">
              <label className="flex items-center gap-2 text-gray-300 hover:text-gray-100 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  id="modal-remember-password"
                  name="modalRememberMe"
                  checked={rememberPassword}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setRememberPassword(checked);
                    if (!checked) {
                      try {
                        localStorage.removeItem('mupporul_remember_me');
                        localStorage.removeItem('mupporul_saved_password');
                      } catch {}
                    }
                  }}
                  className="w-4 h-4 rounded bg-[#181a29] border border-[#282d45] text-amber-500 focus:ring-amber-500/30 accent-amber-500 cursor-pointer"
                />
                <span className="group-hover:text-amber-300 transition-colors font-medium">
                  Remember password
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  closeLoginModal();
                  openChangePasswordModal();
                }}
                className="text-amber-400 hover:text-amber-300 transition-colors font-medium cursor-pointer hover:underline"
              >
                Change password?
              </button>
            </div>

            {/* Submit */}
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
        </div>
      </div>
    </div>
  );
};
