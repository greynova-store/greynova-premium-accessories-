import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { api, setStoredToken } from '../services/api';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useToast } from '../components/ui/Toast';
import { useLoading } from '../context/LoadingContext';
import { UserProfile, UserRole } from '../types/store';

interface LoginPageProps {
  onSuccess: (user: UserProfile & { role: UserRole; username?: string }) => void;
  onNavigate: (path: string) => void;
}

export function LoginPage({ onSuccess, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { success, error: toastError } = useToast();
  const { startLoading, stopLoading } = useLoading();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    startLoading('Authenticating credentials...');

    try {
      // 1. Try Supabase Auth if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (!supaErr && supaData?.session?.access_token) {
            setStoredToken(supaData.session.access_token);
          }
        } catch (sErr) {
          console.warn('[Supabase Auth sign-in fallback]', sErr);
        }
      }

      // 2. Synchronize with server session & role verification
      const res = await api.login({ email: cleanEmail, password });
      setStoredToken(res.token);
      onSuccess(res.user);

      // 3. Role-Based Login Redirection
      if (res.user.role === 'admin' || res.user.role === 'super_admin') {
        success('Administrator Authenticated', `Welcome back, ${res.user.full_name}`);
        onNavigate('/admin');
      } else {
        success('Welcome back', `Signed in successfully as ${res.user.full_name}`);
        onNavigate('/account');
      }
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password. Please verify your credentials.';
      setErrorMessage(msg);
      toastError('Authentication Failed', msg);
    } finally {
      setIsSubmitting(false);
      stopLoading();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 bg-gradient-to-b from-white via-neutral-50 to-neutral-100/70">
      
      {/* Return to store navigation */}
      <div className="w-full max-w-md mb-6">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to GreyNova Store</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-neutral-200/80 p-6 sm:p-8 space-y-6">
        
        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-sm tracking-wider mx-auto shadow-sm">
            GN
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Sign In to GreyNova
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
            Access your orders, saved delivery addresses, and personal hardware wishlist.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                disabled={isSubmitting}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all bg-neutral-50/50"
              />
            </div>
          </div>

          {/* Password with Show/Hide */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                className="text-xs text-neutral-500 hover:text-neutral-900 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isSubmitting}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all bg-neutral-50/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded text-neutral-900 focus:ring-neutral-900"
              />
              <span>Remember session on this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

        </form>

        {/* Footer Link to Signup */}
        <div className="pt-4 border-t border-neutral-100 text-center text-xs text-neutral-500">
          <p>
            Don't have an account yet?{' '}
            <button
              onClick={() => onNavigate('/signup')}
              className="font-bold text-neutral-900 hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>

      </div>

      {/* Subtle store guarantee footer */}
      <div className="mt-8 text-center text-[11px] text-neutral-400">
        <p>GreyNova Technologies · 1-Year Replacement Warranty · Cash on Delivery</p>
      </div>

    </div>
  );
}
