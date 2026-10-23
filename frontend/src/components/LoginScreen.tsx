import React, { useState } from 'react';
import {
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
import { LoadingSpinner } from './LoadingSpinner';

export const LoginScreen: React.FC = () => {
  const { loginWithCredentials, setActiveTab, openChangePasswordModal } = useApp();

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
          if (identifier.toLowerCase().includes('admin')) {
            setActiveTab('analytics');
          } else {
            setActiveTab('temples');
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
    <div className="min-h-screen w-full bg-[#080a12] text-gray-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Sacred ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-amber-500/10 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-xl shadow-amber-500/20 text-black font-extrabold text-2xl border border-amber-300/40">
            🕉️
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            முப்பொருள் • Mupporul
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-[#121424] rounded-3xl border border-[#262940] shadow-2xl p-6 sm:p-7 space-y-5 backdrop-blur-md">
          <div className="border-b border-[#212439] pb-4">
            <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <span>User Login</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Sign in with your username and password to continue.
            </p>
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
          <form id="login-form" name="login" onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username / Email */}
            <div>
              <label htmlFor="login-username" className="block text-gray-300 font-bold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Username or Email *</span>
                </span>
              </label>
              <input
                id="login-username"
                name="username"
                type="text"
                required
                autoComplete="username"
                placeholder="Enter your username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-[#181a29] border border-[#282d45] rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-gray-300 font-bold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password *</span>
                </span>
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
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

            {/* Options: Remember/Save Password & Change Password */}
            <div className="flex items-center justify-between text-xs pt-1 pb-1">
              <label className="flex items-center gap-2 text-gray-300 hover:text-gray-100 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  id="remember-password"
                  name="rememberMe"
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
                onClick={openChangePasswordModal}
                className="text-amber-400 hover:text-amber-300 transition-colors font-medium cursor-pointer hover:underline"
              >
                Change password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="xs" text="" color="#000000" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 text-black" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-gray-500">
          Mupporul • Secure Access
        </p>
      </div>
    </div>
  );
};
