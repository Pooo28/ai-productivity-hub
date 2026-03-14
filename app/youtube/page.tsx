'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Search, Sparkles, Clock, List, ExternalLink, AlertCircle, Loader2, PlayCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function YouTubePage() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [videoId, setVideoId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  const [user, setUser] = useState<any>(null);

  // 1. Fetch history and user on mount
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (!error && data) setHistory(data);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSummarize = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setError('');
    setSummary('');
    setVideoId('');
    
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_FLASK_API_URL}/api/youtube-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to summarize video');
      
      setSummary(data.summary);
      setVideoId(data.video_id);
      
      // Save to Supabase if logged in
      if (user) {
        await supabase.from('videos').insert({
          user_id: user.id,
          youtube_url: url,
          video_id: data.video_id,
          summary: data.summary,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-lavender-glow min-h-screen font-inter selection:bg-blue selection:text-white pb-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-20">
        <div className="mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-navy text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-xl shadow-navy/20"
          >
            <Youtube className="w-4 h-4 text-red-500" />
            <span>Video Insights</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black font-outfit text-navy mb-4 leading-[0.9] uppercase tracking-tighter italic"
          >
            Instant <br />
            <span className="text-navy/40 non-italic">Video Analysis</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-navy/60 font-bold max-w-2xl leading-tight tracking-tight italic"
          >
            Condense hours of video into clear, actionable summaries instantly.
          </motion.p>
        </div>

      <div className="space-y-8">
        {/* Input Card - Cinematic Formatting */}
        <div className="p-10 bg-white rounded-[3rem] shadow-2xl border border-navy/5 flex flex-col md:flex-row gap-6 items-center mb-16 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative flex-grow w-full z-20">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20 w-6 h-6" />
            <input
              type="text"
              placeholder="PASTE YOUTUBE VIDEO URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-16 pr-6 py-6 rounded-2xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-blue transition-all font-inter font-bold text-navy placeholder:text-navy/40 outline-none"
              suppressHydrationWarning
            />
          </div>
          <button
            onClick={handleSummarize}
            disabled={loading || !url.trim()}
            className="group relative w-full md:w-auto flex items-center justify-center gap-3 px-12 py-6 bg-navy text-white rounded-full font-black text-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-navy/30 uppercase tracking-widest whitespace-nowrap italic z-20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Analyze Video
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Preview Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl overflow-hidden aspect-video relative group border border-navy/5 shadow-2xl">
              {videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-navy/20 p-8 text-center italic">
                   <PlayCircle className="w-12 h-12 mb-4 opacity-20" />
                   <div className="text-xs uppercase tracking-widest font-black">Ready for Feed</div>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-white rounded-3xl border border-navy/5 shadow-2xl space-y-6 font-inter">
               <h3 className="font-black font-outfit text-navy/40 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
                 <Clock className="w-4 h-4 text-navy/20" />
                 Archive
               </h3>
               <div className="space-y-3">
                 {history.length > 0 ? history.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Archive item clicked:", item.youtube_url);
                        setSummary(item.summary);
                        setVideoId(item.video_id);
                        setUrl(item.youtube_url);
                      }}
                      className="flex flex-col gap-2 p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-100 border border-zinc-100 transition-all cursor-pointer group relative z-20"
                    >
                      <span className="text-[10px] font-black text-blue truncate uppercase tracking-tighter italic pointer-events-none">{item.youtube_url}</span>
                      <span className="text-xs text-navy/60 line-clamp-2 font-medium leading-relaxed pointer-events-none">{item.summary.substring(0, 100)}...</span>
                    </div>
                 )) : (
                   <div className="p-8 text-center text-[10px] text-navy/20 font-black uppercase tracking-[0.3em] italic">
                      Zero History
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Detailed Summary Column */}
          <div className="lg:col-span-2">
             <div className="bg-white rounded-[3rem] border border-navy/5 shadow-2xl overflow-hidden h-full flex flex-col group">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-8 border-b border-navy/5 flex items-center justify-between relative z-10">
                   <div className="flex items-center gap-4">
                     <div className="p-4 bg-navy/5 rounded-2xl border border-navy/10 shadow-inner">
                        <List className="w-6 h-6 text-blue" />
                     </div>
                     <h2 className="text-2xl font-black font-outfit text-navy tracking-tighter uppercase italic">Synthesis</h2>
                   </div>
                   {videoId && (
                     <a 
                       href={`https://youtube.com/watch?v=${videoId}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="p-4 bg-navy/5 rounded-xl hover:bg-navy/10 border border-navy/5 transition-all text-navy/40 hover:text-navy"
                     >
                        <ExternalLink className="w-5 h-5" />
                     </a>
                   )}
                </div>
                
                <div className="p-12 relative z-10 flex-grow flex flex-col">
                   {loading ? (
                     <div className="m-auto flex flex-col items-center justify-center text-center">
                        <Loader2 className="w-16 h-16 mb-8 animate-spin text-blue" />
                        <h3 className="text-2xl font-black font-outfit text-navy tracking-tighter uppercase italic mb-2">Analyzing Transcripts...</h3>
                        <p className="text-navy/40 font-bold uppercase tracking-widest text-[10px] max-w-xs">Distilling hours of content into intelligence</p>
                     </div>
                   ) : summary ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="prose prose-zinc max-w-none text-navy/70 font-inter font-medium leading-relaxed whitespace-pre-wrap italic"
                      >
                        {summary}
                      </motion.div>
                   ) : (
                     <div className="m-auto flex flex-col items-center justify-center text-center">
                        <div className="p-8 bg-zinc-50 rounded-full border border-zinc-100 mb-8">
                           <Youtube className="w-16 h-16 text-navy/10 stroke-1" />
                        </div>
                        <h3 className="text-xl font-black font-outfit text-navy/20 uppercase tracking-[0.3em] mb-2 italic">Idle Signal</h3>
                        <p className="text-navy/20 font-bold uppercase tracking-widest text-[10px] max-w-[200px]">Waiting for video link injection</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
  </svg>
);
