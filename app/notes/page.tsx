'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, FileText, Sparkles, Copy, Trash2, AlertCircle, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Note {
  id: string;
  title: string;
  content: string;
  summary: string;
  created_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [user, setUser] = useState<any>(null);

  // Fetch all notes and set up auth listener
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        if (!session?.user) { 
          setInitialLoading(false); 
          return; 
        }

        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        const noteList = data || [];
        setNotes(noteList);
        
        // Only auto-select the first note if we don't have an active one yet
        // and we aren't explicitly in "new note" mode (represented by an empty list or first load)
        if (noteList.length > 0 && !activeNoteId) {
          const first = noteList[0];
          setActiveNoteId(first.id);
          setTitle(first.title || '');
          setContent(first.content || '');
          setSummary(first.summary || '');
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []); // Remove activeNoteId dependency to prevent re-runs on selection

  // Auto-save logic
  useEffect(() => {
    if (!content.trim() && !title.trim()) {
      setSaveStatus('idle');
      return;
    }

    if (!user) {
      setSaveStatus('error');
      return;
    }

    const saveTimeout = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const { data, error } = await supabase
          .from('notes')
          .upsert({
            id: activeNoteId || undefined,
            user_id: user.id,
            title: title || 'Untitled Note',
            content: content,
            summary: summary,
          }, { onConflict: 'id' })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setActiveNoteId(data.id);
          // Update the notes list in sidebar
          setNotes(prev => {
            const exists = prev.find(n => n.id === data.id);
            if (exists) return prev.map(n => n.id === data.id ? data : n);
            return [data, ...prev];
          });
        }
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (err) {
        console.error('Auto-save failed:', err);
        setSaveStatus('error');
      }
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [content, title, summary, activeNoteId]);

  const handleSelectNote = (note: Note) => {
    setActiveNoteId(note.id);
    setTitle(note.title || '');
    setContent(note.content || '');
    setSummary(note.summary || '');
    setError('');
    setSaveStatus('idle');
  };

  const handleNewNote = () => {
    setActiveNoteId(null);
    setTitle('');
    setContent('');
    setSummary('');
    setError('');
    setSaveStatus('idle');
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;

      const updated = notes.filter(n => n.id !== id);
      setNotes(updated);

      if (activeNoteId === id) {
        if (updated.length > 0) {
          handleSelectNote(updated[0]);
        } else {
          handleNewNote();
        }
      }
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const handleSummarize = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    const apiBase = process.env.NEXT_PUBLIC_FLASK_API_URL || 
                    (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
    try {
      const resp = await fetch(`${apiBase}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title }),
      });
      const data = await resp.json();
      if (!resp.ok) throw Error(data.error || 'Failed to summarize');
      setSummary(data.summary);
    } catch (err: any) {
      setError(`${err.name}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => navigator.clipboard.writeText(summary);

  return (
    <div className="bg-lavender-glow min-h-screen font-inter selection:bg-blue selection:text-white pb-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-navy text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-xl shadow-navy/20"
          >
            <Brain className="w-4 h-4" />
            <span>Notebook Summarizer</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black font-outfit text-navy mb-4 leading-[0.9] uppercase tracking-tighter italic"
          >
            Transform <br />
            <span className="text-navy/40 non-italic">Your Notes</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-navy/60 font-bold max-w-2xl leading-tight tracking-tight italic"
          >
            AI-powered intelligence that organizes thoughts instantly.
          </motion.p>
        </div>

      <div className="flex gap-6">
        {/* Notes Sidebar */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-navy/5 overflow-hidden h-full flex flex-col">
            <div className="p-8 border-b border-navy/5 flex items-center justify-between">
              <h3 className="font-black text-navy/40 font-outfit text-[10px] uppercase tracking-[0.2em]">Archive</h3>
              <button
                onClick={handleNewNote}
                title="New Note"
                className="p-3 rounded-xl bg-navy text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-navy/20"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[500px] flex-grow custom-scrollbar">
              {initialLoading ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-navy/20" />
                </div>
              ) : notes.length === 0 ? (
                <p className="py-8 text-center text-navy/20 text-sm font-bold italic px-4 uppercase tracking-widest">Empty Archive</p>
              ) : (
                notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => handleSelectNote(note)}
                    className={`group relative p-6 cursor-pointer border-b border-navy/5 hover:bg-navy/5 transition-all ${
                      activeNoteId === note.id ? 'bg-navy/5' : ''
                    }`}
                  >
                    <p className={`font-black text-lg font-outfit leading-none mb-1 truncate ${activeNoteId === note.id ? 'text-blue' : 'text-navy'}`}>
                      {note.title || 'Untitled Note'}
                    </p>
                    <p className="text-[10px] text-navy/40 truncate font-black uppercase tracking-widest leading-none">{note.content?.slice(0, 40) || 'No Content'}</p>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-navy/20 hover:text-red-500 transition-all"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {activeNoteId === note.id && (
                      <motion.div layoutId="active-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue rounded-r-full" />
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="p-12 bg-white rounded-[3rem] shadow-2xl border border-navy/5 flex flex-col gap-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-navy/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <input
                type="text"
                placeholder="NOTE TITLE"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-0 py-2 bg-transparent border-b border-navy/10 focus:border-blue transition-all font-outfit font-black tracking-tighter text-4xl text-navy placeholder:text-navy/40 outline-none uppercase italic relative z-10"
              />
              
              <div className="relative">
                <textarea
                  placeholder="Paste your thoughts here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-[500px] px-6 py-6 rounded-3xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-blue transition-all resize-none font-inter text-xl text-navy/80 leading-relaxed font-medium placeholder:text-navy/10 outline-none"
                />
                <div className="absolute bottom-6 right-6 text-[10px] font-black tracking-widest uppercase italic">
                  <AnimatePresence>
                    {saveStatus === 'saving' && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-blue flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Syncing...
                      </motion.span>
                    )}
                    {saveStatus === 'saved' && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-navy/40">
                        CLOUD SYNCED
                      </motion.span>
                    )}
                    {saveStatus === 'error' && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500">
                        AUTH REQUIRED
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-center justify-end pt-8 border-t border-navy/5">
                <button
                  onClick={handleSummarize}
                  disabled={loading || !content.trim()}
                  className="group relative flex items-center gap-3 px-12 py-6 bg-navy text-white rounded-full font-black text-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-navy/30 uppercase tracking-tighter italic"
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                   {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                   <span>Summarize</span>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm"
                >
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Output Section */}
          <div className="h-full">
            <div className="h-full p-12 bg-white border border-navy/5 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col group">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
                <Brain className="w-64 h-64 text-navy" />
              </div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-12 pb-6 border-b border-navy/5">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-navy/5 rounded-2xl border border-navy/10">
                      <FileText className="w-6 h-6 text-blue" />
                    </div>
                    <h2 className="text-3xl font-black font-outfit text-navy tracking-tighter uppercase italic mb-0">Analysis</h2>
                  </div>
                  {summary && (
                    <button 
                      onClick={copyToClipboard} 
                      className="p-4 rounded-xl bg-navy/5 hover:bg-navy/10 border border-navy/5 transition-all text-navy/40 hover:text-navy" 
                      title="Copy to clipboard"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="flex-grow flex flex-col">
                  {!summary && !loading && (
                    <div className="m-auto flex flex-col items-center justify-center text-center py-12">
                      <div className="p-6 bg-navy/5 rounded-full border border-navy/5 mb-6">
                        <Brain className="w-12 h-12 text-navy/10 stroke-1" />
                      </div>
                      <p className="font-outfit font-bold text-navy/20 uppercase tracking-widest text-sm text-center max-w-[200px]">
                        Input text for <br/>AI Synthesis
                      </p>
                    </div>
                  )}
                  {loading && (
                     <div className="m-auto flex flex-col items-center justify-center text-center py-12">
                        <Loader2 className="w-16 h-16 mb-8 animate-spin text-blue" />
                        <h3 className="text-2xl font-black font-outfit text-navy tracking-tighter uppercase italic mb-2">Analyzing...</h3>
                        <p className="text-navy/40 font-bold uppercase tracking-widest text-[10px]">Consulting the AI brain</p>
                     </div>
                  )}
                  {summary && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="prose prose-zinc max-w-none font-inter text-navy/70 whitespace-pre-wrap leading-relaxed font-medium italic"
                    >
                      {summary}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
