'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Sparkles, CheckCircle2, Circle, Clock, Trash2, LayoutList, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Task {
  id: string;
  title: string;
  deadline: string;
  is_completed: boolean;
}

const formatDeadline = (deadlineStr: string) => {
  if (!deadlineStr || deadlineStr === 'Today') return deadlineStr;
  try {
    const date = new Date(deadlineStr);
    if (isNaN(date.getTime())) return deadlineStr;
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return deadlineStr;
  }
};

export default function SchedulePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  
  // Initialize with current time in YYYY-MM-DDTHH:mm format
  const getDefaultDeadline = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };
  
  const [newDeadline, setNewDeadline] = useState(getDefaultDeadline());
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  const [user, setUser] = useState<any>(null);

  // 1. Fetch tasks and user on mount
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        if (session?.user) {
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: true });

          if (error) throw error;
          setTasks(data || []);
        }
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks');
      } finally {
        setInitialLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [taskSaving, setTaskSaving] = useState(false);

  const addTask = async () => {
    if (!newTask.trim()) return;
    
    setTaskSaving(true);
    try {
      if (!user) {
        setError('You must be logged in to save tasks');
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: newTask,
          deadline: newDeadline || 'Today',
          is_completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      
      setTasks([...tasks, data]);
      setNewTask('');
      setNewDeadline(getDefaultDeadline());
      setError('');
    } catch (err: any) {
      console.error('Error adding task:', err);
      setError('Failed to add task');
    } finally {
      setTaskSaving(false);
    }
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
    } catch (err: any) {
      console.error('Error toggling task:', err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err: any) {
      console.error('Error deleting task:', err);
    }
  };

  const getAISuggestion = async () => {
    if (tasks.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const apiBase = process.env.NEXT_PUBLIC_FLASK_API_URL || 
                      (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
      const resp = await fetch(`${apiBase}/api/schedule-suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks }),
      });
      
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to get suggestions');
      
      setSuggestion(data.suggestion);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
            <Calendar className="w-4 h-4 text-white" />
            <span>Productivity Planner</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black font-outfit text-navy mb-4 leading-[0.9] uppercase tracking-tighter italic"
          >
            Optimize <br />
            <span className="text-navy/40 non-italic">Your Flow</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-navy/60 font-bold max-w-2xl leading-tight tracking-tight italic"
          >
            Intelligent task orchestration powered by Luminous Lavender design.
          </motion.p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task List Section */}
        <div className="space-y-8 h-full">
          <div className="p-12 bg-white rounded-[3rem] shadow-2xl border border-navy/5 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <h3 className="text-3xl font-black font-outfit text-navy tracking-tighter mb-10 flex items-center gap-4 uppercase italic relative z-10">
              <div className="p-4 bg-navy text-white rounded-2xl shadow-xl shadow-navy/20">
                <LayoutList className="w-8 h-8" />
              </div>
              The List
            </h3>
            
            <div className="space-y-6 mb-12 relative z-10">
               <div className="flex flex-col xl:flex-row gap-6">
                  <div className="relative flex-grow">
                     <div className="absolute left-6 top-6 text-navy/20 font-black text-[10px] uppercase tracking-[0.1em]">TASK</div>
                    <textarea
                      placeholder="ENTER YOUR NEXT MISSION..."
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      className="w-full pl-20 pr-6 py-6 rounded-3xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-blue transition-all font-inter font-bold text-navy placeholder:text-navy/10 outline-none uppercase italic min-h-[140px] resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-4 xl:w-80">
                    <div className="relative h-1/2">
                       <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20 font-black text-[10px] uppercase tracking-[0.1em]">DUE</div>
                      <input
                        type="datetime-local"
                        value={newDeadline}
                        onChange={(e) => setNewDeadline(e.target.value)}
                        className="w-full h-full pl-16 pr-6 py-6 rounded-2xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-blue transition-all font-inter font-bold text-navy text-sm outline-none uppercase italic"
                      />
                    </div>
                    <button
                      onClick={addTask}
                      disabled={taskSaving}
                      className="h-1/2 bg-navy text-white rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-navy/30 flex items-center justify-center gap-3 font-black uppercase italic tracking-widest"
                    >
                      {taskSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                      Add Task
                    </button>
                  </div>
               </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar flex-grow relative z-10">
              {initialLoading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4">
                   <Loader2 className="w-10 h-10 animate-spin text-blue" />
                   <p className="text-navy/40 text-[10px] font-black uppercase tracking-widest italic">Syncing Nexus...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center">
                   <div className="p-8 bg-zinc-50 rounded-full mb-8 border border-zinc-100 italic">
                      <LayoutList className="w-12 h-12 text-navy/10" />
                   </div>
                   <h2 className="text-xl font-black font-outfit text-navy/20 uppercase tracking-[0.3em] mb-2 italic">No Active Signal</h2>
                   <p className="text-navy/20 font-bold uppercase tracking-widest text-[10px] max-w-xs px-4">Initialize your productivity cycle above</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group flex items-center justify-between p-8 bg-zinc-50 rounded-[2.5rem] hover:bg-zinc-100 transition-all border border-zinc-100 relative overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-gradient-to-r from-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="flex items-center gap-8 relative z-10">
                       <button onClick={() => toggleTask(task.id, task.is_completed)} className="transition-transform active:scale-90">
                         {task.is_completed ? (
                           <CheckCircle2 className="w-10 h-10 text-blue drop-shadow-[0_0_10px_rgba(107,138,255,0.4)]" />
                         ) : (
                           <Circle className="w-10 h-10 text-navy/10 group-hover:text-navy/30" />
                         )}
                       </button>
                       <div>
                         <div className={`text-2xl font-black font-outfit tracking-tighter leading-none mb-2 uppercase italic transition-all ${task.is_completed ? 'text-navy/10 line-through' : 'text-navy'}`}>
                           {task.title}
                         </div>
                         <div className="text-[10px] text-navy/40 font-black uppercase tracking-widest flex items-center gap-2 italic">
                           <Clock className="w-3.5 h-3.5 text-blue/40" />
                           {formatDeadline(task.deadline)}
                         </div>
                       </div>
                     </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-3 text-navy/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all relative z-10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {tasks.length > 0 && (
              <div className="mt-12 pt-10 border-t border-navy/5 mt-auto relative z-10">
                <button
                  onClick={getAISuggestion}
                  disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-4 py-8 bg-navy text-white rounded-[2rem] font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-navy/20 uppercase tracking-widest italic overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Sparkles className="w-8 h-8 text-blue" />}
                  {loading ? 'Synthesizing...' : 'AI Orchestration'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Suggestion Section */}
        <div className="h-full">
           <div className="h-full p-12 bg-white rounded-[3rem] border border-navy/5 shadow-2xl relative overflow-hidden flex flex-col group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-12 pb-6 border-b border-navy/5">
                   <div className="p-4 bg-navy/5 rounded-2xl border border-navy/10">
                      <Sparkles className="w-8 h-8 text-purple-600" />
                   </div>
                   <h2 className="text-3xl font-black font-outfit text-navy tracking-tighter uppercase mb-0 italic">Strategy</h2>
                </div>

                <div className="flex-grow flex flex-col overflow-y-auto h-[500px] pr-4">
                   {loading ? (
                     <div className="m-auto flex flex-col items-center justify-center text-center py-24">
                        <div className="relative mb-8">
                           <Loader2 className="w-20 h-20 animate-spin text-purple-600 opacity-20" />
                           <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-purple-600 animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black font-outfit text-navy tracking-tighter uppercase italic mb-2">Analyzing Workflow...</h2>
                        <p className="text-navy/40 font-bold uppercase tracking-widest text-[10px] max-w-xs">Calculating the peak efficiency path</p>
                     </div>
                   ) : suggestion ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="prose prose-zinc max-w-none text-navy/70 font-inter font-medium leading-relaxed text-sm italic"
                      >
                         <div className="whitespace-pre-wrap">{suggestion}</div>
                      </motion.div>
                   ) : (
                      <div className="m-auto flex flex-col items-center justify-center text-center py-24">
                         <div className="p-10 bg-zinc-50 rounded-full border border-zinc-100 mb-8 italic">
                           <Calendar className="w-16 h-16 text-navy/10 stroke-1" />
                         </div>
                         <h2 className="text-xl font-black font-outfit text-navy/20 uppercase tracking-[0.3em] mb-2 italic">Idle Strategy</h2>
                         <p className="text-navy/20 font-bold uppercase tracking-widest text-[10px] max-w-xs px-4">Inject tasks to generate synthesis</p>
                      </div>
                   )}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600 font-black text-xs uppercase tracking-widest italic"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
);
}
