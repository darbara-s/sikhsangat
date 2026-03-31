"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      await signInWithPopup(auth, googleProvider);
      router.push('/profile');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google. Ensure your Firebase configuration allows localhost or check API keys.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-[var(--foreground)] bg-[var(--background)]">
      {/* Left side visually stunning image */}
      <div className="hidden lg:flex w-1/2 bg-[var(--secondary)] relative flex-col justify-center items-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--secondary)] via-transparent to-transparent"></div>
        <div className="relative z-10 text-white max-w-lg text-center mt-32">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl">
            <span className="text-4xl text-[var(--color-primary)] leading-none">☬</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight">Connect with the Sangat</h1>
          <p className="text-lg text-gray-300">Discover upcoming Diwans, track your spiritual journey, and contribute to the community platform.</p>
        </div>
      </div>

      {/* Right side login form */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 relative bg-[var(--surface)]">
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-[var(--muted)] hover:text-[var(--color-primary)] transition-colors font-medium">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
        
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-10">
            <div className="lg:hidden w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-2xl text-white leading-none">☬</span>
            </div>
            <h2 className="text-3xl font-bold mb-3">Welcome Back</h2>
            <p className="text-[var(--muted)]">Sign in or create an account to manage your events and performer interactions.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-[var(--background)] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 py-3.5 px-4 rounded-xl font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
              {isLoading ? "Signing in..." : "Continue with Google"}
            </button>
            <button className="w-full flex items-center justify-center gap-3 bg-[var(--background)] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 py-3.5 px-4 rounded-xl font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 opacity-60 cursor-not-allowed" title="Not implemented in MVP">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8v-7h-2.5v-2.8h2.5V9.75c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.8H13.1v7c4.56-.93 8-4.96 8-9.8 0-5.52-4.48-10-10-10z" fill="#1877F2"/></svg>
              Continue with Meta
            </button>
            <button className="w-full flex items-center justify-center gap-3 bg-[var(--background)] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 py-3.5 px-4 rounded-xl font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 opacity-60 cursor-not-allowed" title="Not implemented in MVP">
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.85 3.55-.91 1.58-.09 2.86.64 3.58 1.84-2.81 1.57-2.34 5.3 0 6.6-1.06 2.05-2.17 3.65-3.21 4.64zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="currentColor"/></svg>
              Continue with Apple
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
            <p className="text-center text-sm text-[var(--muted)]">
              By joining, you agree to our <br/><Link href="#" className="font-semibold text-[var(--foreground)] hover:text-[var(--color-primary)]">Terms of Service</Link> and <Link href="#" className="font-semibold text-[var(--foreground)] hover:text-[var(--color-primary)]">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
