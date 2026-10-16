import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api, setStoredToken } from '../services/api';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useToast } from '../components/ui/Toast';
import { useLoading } from '../context/LoadingContext';
import { UserProfile, UserRole } from '../types/store';

interface SignupPageProps {
  onSuccess: (user: UserProfile & { role: UserRole; username?: string }) => void;
  onNavigate: (path: string) => void;
  onOpenPolicy: (policy: string) => void;
}

export function SignupPage({ onSuccess, onNavigate, onOpenPolicy }: SignupPageProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { success, error: toastError } = useToast();
  const { startLoading, stopLoading } = useLoading();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phoneNumber.trim();

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please review and agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsSubmitting(true);
    startLoading('Creating your customer account...');

    try {
      // 1. If Supabase Auth is configured, sign up via Supabase
      if (isSupabaseConfigured && supabase) {
        const { data: supaData, error: supaErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              phone_number: cleanPhone,
            },
          },
        });

        if (supaErr) {
          throw new Error(supaErr.message);
        }

        if (supaData?.session?.access_token) {
          setStoredToken(supaData.session.access_token);
        }
      }

      // 2. Register on server (server enforces customer role)
      const res = await api.register({
        email: cleanEmail,
        password,
        full_name: cleanName,
        phone_number: cleanPhone || undefined,
      });

      setStoredToken(res.token);
      onSuccess(res.user);
      success('Account Created', 'Welcome to GreyNova. Your account is active.');
      onNavigate('/');
    } catch (err: any) {
      const msg = err.message || 'Unable to create account. An account with this email may already exist.';
      setErrorMessage(msg);
      toastError('Signup Failed', msg);
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

      {/* Main Signup Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-neutral-200/80 p-6 sm:p-8 space-y-6">
        
        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-sm tracking-wider mx-auto shadow-sm">
            GN
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Create Your Account
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
            Join GreyNova for seamless checkout, order tracking, and 1-Year warranty registration.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Asad Tanoli"
                autoComplete="name"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all bg-neutral-50/50"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Email Address *
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

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Phone Number (For Courier Delivery)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                disabled={isSubmitting}
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="0300 1234567"
                autoComplete="tel"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all bg-neutral-50/50"
              />
            </div>
          </div>

          {/* Password with Show/Hide */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Password (Min 8 Characters) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isSubmitting}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all bg-neutral-50/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 p-1.5 text-neutral-400 hover:text-neutral-700 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Security strength:</span>
                  <span className={`font-semibold capitalize ${
                    password.length < 8 ? 'text-rose-500' :
                    password.length >= 10 && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {password.length < 8 ? 'Weak (8+ chars needed)' :
                     password.length >= 10 && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 'Strong' : 'Moderate'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 h-1.5">
                  <div className={`h-full rounded-full transition-all ${
                    password.length > 0 ? (password.length < 8 ? 'bg-rose-500' : 'bg-amber-500') : 'bg-neutral-200'
                  }`} />
                  <div className={`h-full rounded-full transition-all ${
                    password.length >= 8 ? (password.length >= 10 && /[0-9]/.test(password) ? 'bg-amber-500' : 'bg-amber-400') : 'bg-neutral-200'
                  }`} />
                  <div className={`h-full rounded-full transition-all ${
                    password.length >= 10 && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 'bg-emerald-500' : 'bg-neutral-200'
                  }`} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Confirm Password *
              </label>
              {confirmPassword.length > 0 && (
                <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                  password === confirmPassword ? 'text-emerald-600' : 'text-rose-500'
                }`}>
                  {password === confirmPassword ? '✓ Passwords match' : '✕ Does not match'}
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isSubmitting}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none transition-all bg-neutral-50/50 ${
                  confirmPassword.length > 0
                    ? password === confirmPassword
                      ? 'border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                      : 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
                }`}
              />
            </div>
          </div>

          {/* Terms & Privacy Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-600">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded text-neutral-900 focus:ring-neutral-900"
              />
              <span className="leading-relaxed">
                I agree to GreyNova's{' '}
                <button
                  type="button"
                  onClick={() => onOpenPolicy('terms')}
                  className="font-bold text-neutral-900 underline hover:text-neutral-700"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => onOpenPolicy('privacy')}
                  className="font-bold text-neutral-900 underline hover:text-neutral-700"
                >
                  Privacy Policy
                </button>
                .
              </span>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

        </form>

        {/* Footer Link to Login */}
        <div className="pt-4 border-t border-neutral-100 text-center text-xs text-neutral-500">
          <p>
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('/login')}
              className="font-bold text-neutral-900 hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>

      </div>

      {/* Subtle store guarantee footer */}
      <div className="mt-8 text-center text-[11px] text-neutral-400">
        <p>GreyNova Technologies · Cash on Delivery Nationwide · Secure Authentication</p>
      </div>

    </div>
  );
}
