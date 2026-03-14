'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Sparkles, Brain, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data?.user?.identities?.length === 0) {
        setError('This email is already registered. Try logging in.');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
           <div className="inline-flex p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 mb-4">
              <Brain className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-3xl font-bold font-outfit text-gray-900">Create Free Account</h1>
           <p className="text-gray-500 mt-2">Free forever. No credits or card required.</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-indigo-100/40 relative overflow-hidden">
           <AnimatePresence mode="wait">
             {success ? (
               <motion.div 
                 key="success"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-center py-8"
               >
                 <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                 <p className="text-gray-500 mb-8">We've sent a verification link to <span className="font-bold text-indigo-600">{email}</span>.</p>
                 <Link 
                   href="/login"
                   className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline"
                 >
                   Return to Login <ArrowLeft className="w-4 h-4 rotate-180" />
                 </Link>
               </motion.div>
             ) : (
               <motion.div key="form">
                 <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                       <input
                         type="text"
                         placeholder="Full Name"
                         value={fullName}
                         onChange={(e) => setFullName(e.target.value)}
                         className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-inter"
                         required
                       />
                    </div>
                    <div className="relative">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                       <input
                         type="email"
                         placeholder="Email address"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-inter"
                         required
                       />
                    </div>
                    <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                       <input
                         type="password"
                         placeholder="Create Password"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-inter"
                         required
                         minLength={6}
                       />
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                      Create Account
                    </button>
                 </form>

                 <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                    <p className="text-sm text-gray-500">
                      Already have an account?{' '}
                      <Link href="/login" className="text-indigo-600 font-bold hover:underline">
                        Sign In
                      </Link>
                    </p>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
           
           {/* Decorative elements */}
           <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
              <Sparkles className="w-32 h-32 text-indigo-600" />
           </div>
        </div>
      </motion.div>
    </div>
  );
}
