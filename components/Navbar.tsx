'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Brain, Youtube, Briefcase, Calendar, User, LogIn, Menu, X, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { BlueprintLogo } from './BlueprintLogo';

const Navbar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    
    supabase.auth.getUser().then(({ data }: any) => {
      setUser(data?.user);
    });

    const { data: { subscription } }: any = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
      setUser(session?.user ?? null);
      if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED' || _event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <div className="fixed top-8 left-0 right-0 z-[100] px-6 pointer-events-none">
      <motion.nav
        initial={{ y: -100, x: '-50%' }}
        animate={{ y: 0, x: '-50%' }}
        className={`fixed left-1/2 pointer-events-auto transition-all duration-700 ease-[0.16, 1, 0.3, 1] ${
          scrolled ? 'w-[450px]' : 'w-[90%] max-w-7xl'
        }`}
      >
        <div className="glass rounded-full px-8 py-3.5 flex items-center justify-between shadow-2xl border border-white/30 backdrop-blur-3xl">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <BlueprintLogo scrolled={scrolled} />
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                {!scrolled && (
                  <div className="hidden md:flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center text-blue font-black text-[10px]">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <span className="text-navy font-bold text-xs uppercase tracking-widest">{user.email?.split('@')[0]}</span>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-navy text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {!scrolled && (
                  <Link href="/login" className="text-navy font-black text-[10px] uppercase tracking-widest hover:text-blue transition-colors">
                    Login
                  </Link>
                )}
                <Link
                  href="/signup"
                  className="px-8 py-3 bg-blue text-white rounded-full font-black text-[12px] uppercase tracking-[0.15em] hover:scale-105 transition-all shadow-xl shadow-blue/20"
                >
                  {scrolled ? 'Join' : 'Try Hub for Free'}
                </Link>
              </div>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-navy hover:bg-navy/5 rounded-full transition-colors"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-full p-6 glass rounded-[2rem] md:hidden"
            >
              <div className="space-y-4">
                {user ? (
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="flex w-full items-center justify-center gap-3 px-4 py-4 bg-accent-coral/10 text-accent-coral font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
                  >
                    Logout
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex w-full items-center justify-center gap-2 px-4 py-4 text-navy font-black uppercase tracking-widest text-xs border border-navy/10 rounded-2xl transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsOpen(false)}
                      className="flex w-full items-center justify-center gap-2 px-4 py-4 bg-blue text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue/20 transition-all"
                    >
                      Get Started Free
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

export default Navbar;
