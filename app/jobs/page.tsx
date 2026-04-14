'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Search, Sparkles, MapPin, Globe, ExternalLink, AlertCircle, Loader2, Building, Send, Plus, Filter, X, FileText, CheckCircle2, ChevronRight, DollarSign } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export default function JobSearchPage() {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [currentDraft, setCurrentDraft] = useState('');
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [searched, setSearched] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Fetch history
  useEffect(() => {
    if (!isLoaded || !user) return;
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (!error && data) setHistory(data);
    };
    fetchHistory();
  }, [user, isLoaded]);

  const handleSearch = async () => {
    if (!role.trim()) return;
    
    setLoading(true);
    setSearched(true);
    setError('');
    setSummary('');
    setJobs([]);
    
    const searchLocation = location.trim() || 'Remote';
    
    try {
      const apiBase = process.env.NEXT_PUBLIC_FLASK_API_URL || 
                      (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
      const resp = await fetch(`${apiBase}/api/job-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: role,
          location: searchLocation,
          skills: '' 
        }),
      });
      
      const contentType = resp.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await resp.json();
      } else {
        const text = await resp.text();
        throw new Error(`Server error (${resp.status}): ${text.substring(0, 100)}...`);
      }
      
      if (!resp.ok) throw new Error(data?.error || 'Failed to search jobs');
      
      setSummary(data.summary);
      setJobs(data.jobs || []);
      
      // Save to Supabase if logged in via Clerk
      if (user) {
        const { data: saved, error: saveErr } = await supabase.from('jobs').insert({
          user_id: user.id,
          query: `${role} in ${searchLocation}`,
          results: data.summary,
        }).select().single();
        
        if (!saveErr && saved) {
          setHistory(prev => [saved, ...prev.slice(0, 4)]);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateDraft = async (jobDetails: string) => {
    setIsDrafting(true);
    setCurrentDraft('');
    setShowDraftModal(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_FLASK_API_URL || 
                      (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
      const resp = await fetch(`${apiBase}/api/draft-cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_details: jobDetails, skills: '' }),
      });
      
      const contentType = resp.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await resp.json();
      } else {
        const text = await resp.text();
        throw new Error(`Server error (${resp.status}): ${text.substring(0, 100)}...`);
      }
      
      if (!resp.ok) throw new Error(data?.error || 'Failed to generate draft');
      setCurrentDraft(data.draft);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <div className="bg-lavender-glow min-h-screen font-inter selection:bg-blue selection:text-white pb-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-navy text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-xl shadow-navy/20"
          >
            <Briefcase className="w-4 h-4" />
            <span>AI Job Hunt</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black font-outfit text-navy mb-4 leading-[0.9] uppercase tracking-tighter italic"
          >
            Smarter <br />
            <span className="text-navy/40 non-italic">Opportunity Search</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-navy/60 font-bold max-w-2xl leading-tight tracking-tight italic"
          >
            Precision matching technology that finds your next career milestone.
          </motion.p>
        </div>

      <div className="space-y-8">
        {/* Search Bar - Prodigy OS Layout Enhanced */}
        <div className="p-10 bg-white rounded-[3rem] shadow-2xl border border-navy/5 flex flex-col lg:flex-row gap-6 items-center mb-16 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative flex-grow w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20 w-6 h-6" />
            <input
              type="text"
              placeholder="JOB ROLE (E.G. SOFTWARE ENGINEER)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-16 pr-6 py-6 rounded-2xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-blue transition-all font-inter font-bold text-navy placeholder:text-navy/10 outline-none uppercase italic"
              suppressHydrationWarning
            />
          </div>
          <div className="relative flex-grow w-full">
            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20 w-6 h-6" />
            <input
              type="text"
              placeholder="LOCATION (E.G. NEW YORK)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-16 pr-6 py-6 rounded-2xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-blue transition-all font-inter font-bold text-navy placeholder:text-navy/10 outline-none uppercase italic"
              suppressHydrationWarning
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !role.trim()}
            className="group relative w-full lg:w-auto flex items-center justify-center gap-3 px-12 py-6 bg-navy text-white rounded-full font-black text-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-navy/30 uppercase tracking-widest whitespace-nowrap italic"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Find Jobs
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm italic font-bold"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full">
           {/* Search Results */}
           <div className="bg-white rounded-[2rem] border border-navy/5 shadow-2xl min-h-[500px] overflow-hidden">
               <div className="p-8 border-b border-navy/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-navy/5 rounded-2xl border border-navy/10">
                       <Building className="w-6 h-6 text-blue" />
                    </div>
                    <h2 className="text-2xl font-black font-outfit text-navy tracking-tighter uppercase italic">Curated Opportunities</h2>
                  </div>
                </div>
              
              <div className="p-8">
                 {loading ? (
                   <div className="py-24 flex flex-col items-center justify-center text-center">
                      <div className="relative mb-8">
                         <Loader2 className="w-20 h-20 animate-spin text-blue opacity-20" />
                         <Search className="absolute inset-0 m-auto w-8 h-8 text-blue animate-pulse" />
                      </div>
                      <h2 className="text-3xl font-black font-outfit text-navy tracking-tighter uppercase italic mb-2">Nexus Scanning...</h2>
                      <p className="text-navy/40 font-bold uppercase tracking-widest text-[10px]">Scouring the digital frontier</p>
                   </div>
                 ) : jobs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-[10px] font-black text-navy/20 uppercase tracking-[0.2em] border-b border-navy/5">
                            <th className="px-8 py-6">Company</th>
                            <th className="px-8 py-6">Role</th>
                            <th className="px-8 py-6">Location</th>
                            <th className="px-8 py-6 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {jobs.map((job, idx) => (
                            <motion.tr
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="group hover:bg-zinc-50 transition-colors"
                            >
                              <td className="px-8 py-8">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center font-black text-navy/20 uppercase text-xs italic">
                                    {job.company?.[0] || 'J'}
                                  </div>
                                  <span className="font-bold text-navy tracking-tight italic">{job.company}</span>
                                </div>
                              </td>
                              <td className="px-8 py-8">
                                <div className="space-y-1">
                                  <span className="block font-bold text-navy text-sm group-hover:text-blue transition-colors uppercase tracking-tight italic">{job.role || job.title}</span>
                                  {job.salary_estimate && (
                                    <span className="text-[10px] text-green-600 font-black uppercase tracking-widest italic bg-green-50 px-2 py-0.5 rounded-md inline-block">
                                      {job.salary_estimate}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-8 py-8">
                                <div className="flex items-center gap-2 text-navy/40 font-bold uppercase tracking-widest text-[10px]">
                                  <MapPin className="w-3.5 h-3.5 text-blue/40" />
                                  {job.location || 'Remote'}
                                </div>
                              </td>
                              <td className="px-8 py-8 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <button
                                    onClick={() => generateDraft(`${job.role || job.title} at ${job.company}`)}
                                    className="p-3 bg-navy/5 text-navy/40 rounded-xl hover:bg-navy hover:text-white transition-all border border-navy/5"
                                    title="AI Cover Letter"
                                  >
                                    <FileText className="w-5 h-5" />
                                  </button>
                                  <a 
                                    href={job.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="group/btn relative px-8 py-3 bg-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all overflow-hidden italic"
                                  >
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity" />
                                    <span className="relative z-10 flex items-center gap-2">
                                       Apply
                                       <ExternalLink className="w-3.5 h-3.5" />
                                    </span>
                                  </a>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 ) : searched ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                       <div className="p-8 bg-navy/5 rounded-full mb-8 border border-navy/5">
                          <Sparkles className="w-12 h-12 text-blue animate-pulse" />
                       </div>
                       <h2 className="text-2xl font-black font-outfit text-navy tracking-tighter uppercase italic mb-2">Signal Processed</h2>
                       <p className="text-navy/40 font-bold uppercase tracking-widest text-[10px] max-w-md px-4">{summary || "No specific matches found for this criteria."}</p>
                       <button 
                         onClick={() => {setSearched(false); setRole(''); setLocation('');}}
                         className="mt-8 text-blue font-black uppercase tracking-[0.2em] text-[10px] italic hover:tracking-[0.3em] transition-all"
                       >
                         Clear Nexus and Retake
                       </button>
                    </div>
                 ) : (
                   <div className="py-24 flex flex-col items-center justify-center text-center">
                      <div className="p-10 bg-zinc-50 rounded-full mb-8 border border-zinc-100 italic">
                         <MapPin className="w-16 h-16 text-navy/10 stroke-1" />
                      </div>
                      <h2 className="text-xl font-black font-outfit text-navy/20 uppercase tracking-[0.3em] mb-2 italic">Idle Signal</h2>
                      <p className="text-navy/20 font-bold uppercase tracking-widest text-[10px] max-w-xs px-4">Inject role and location parameters to initiate scan</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* History Section - Minimal Tray */}
        {history.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-20 pt-16 border-t border-navy/5"
          >
            <h3 className="text-xl font-black font-outfit text-navy/20 uppercase tracking-[0.3em] mb-10 flex items-center gap-4 italic">
               <Clock className="w-5 h-5" />
               Signal History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    const [hRole, hLoc] = (item.query || '').split(' in ');
                    setRole(hRole || '');
                    setLocation(hLoc || '');
                    setSummary(item.results || '');
                    setSearched(true);
                  }}
                  className="p-8 bg-white rounded-3xl border border-navy/5 shadow-xl hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-navy/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="text-[10px] font-black text-blue uppercase tracking-widest mb-2 italic">{item.query}</div>
                    <div className="text-xs text-navy/40 line-clamp-2 font-bold leading-relaxed">{item.results}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Cover Letter Modal - Cinematic Glass */}
      <AnimatePresence>
        {showDraftModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-navy/20 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-white border border-navy/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue/5 to-transparent pointer-events-none" />
              
              <div className="p-10 border-b border-navy/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-navy/5 rounded-2xl border border-navy/10">
                    <FileText className="w-6 h-6 text-blue" />
                  </div>
                  <h3 className="text-3xl font-black font-outfit text-navy tracking-tighter uppercase italic">Synthesis Draft</h3>
                </div>
                <button 
                  onClick={() => setShowDraftModal(false)}
                  className="p-3 hover:bg-zinc-50 rounded-full transition-colors font-black"
                >
                  <X className="w-6 h-6 text-navy/20" />
                </button>
              </div>
              
              <div className="p-10 relative z-10">
                {isDrafting ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-16 h-16 text-blue animate-spin mb-6" />
                    <p className="text-navy/40 font-black uppercase tracking-widest text-[10px]">AI is weaving your narrative...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-100 font-inter text-navy/70 leading-relaxed whitespace-pre-wrap font-medium h-[400px] overflow-y-auto custom-scrollbar italic">
                      {currentDraft || "No draft generated."}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentDraft);
                        alert('Draft copied to clipboard!');
                      }}
                      className="w-full group relative flex items-center justify-center gap-3 py-6 bg-navy text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-navy/20 italic"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      Copy to Clipboard
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
