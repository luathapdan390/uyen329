/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Play, Loader2, Shield, Crown, BookOpen, Compass, Clock, AlertOctagon, Trophy, PieChart } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- CONFIGURATION ---
const BOT_TOKEN = '8260200134:AAFlf6xMu9DAYAKWDJVoLFczYRRzWVqijnY';
const CHAT_ID = '6789535208';
const TARGET_TIME = 17 * 60; 
const MIN_WORDS = 150;

export default function App() {
  const [state, setState] = useState<'WELCOME' | 'QUIZ' | 'COMPLETION'>('WELCOME');
  const [name, setName] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState<any>(null);
  const [essay, setEssay] = useState('');
  const [timeLeft, setTimeLeft] = useState(TARGET_TIME);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state === 'QUIZ' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && state === 'QUIZ') {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [state, timeLeft]);

  // --- WORD COUNT LOGIC ---
  useEffect(() => {
    const words = essay.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [essay]);

  // --- FULLSCREEN EXIT DETECTION ---
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && state === 'QUIZ') {
        alert("LUẬT TỬ THẦN: Bạn đã thoát chế độ tập trung. Nhiệm vụ thất bại!");
        handleBackToHQ();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [state]);

  const handleStart = async () => {
    if (!name.trim() || !selectedArchetype) {
      alert("Chiến binh cần danh tính và hệ nhân vật!");
      return;
    }
    try {
      if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      setState('QUIZ');
      setTimeLeft(TARGET_TIME);
      setEssay('');
    } catch (err) { setState('QUIZ'); }
  };

  const handleBackToHQ = async () => {
    if (document.fullscreenElement) {
        try { await document.exitFullscreen(); } catch (e) {}
    }
    setState('WELCOME');
    setEssay('');
    setTimeLeft(TARGET_TIME);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const finalScore = wordCount >= MIN_WORDS ? 10 : 5;
    
    // Chuyển màn hình ngay lập tức để học sinh không bị đợi
    setState('COMPLETION');
    if (finalScore === 10) confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });

    // Gửi Telegram chạy ngầm
    const message = `💀 WRITING TASK 1 - PIE CHART SURVIVAL\n👤 Warrior: ${name}\n🎭 Archetype: ${selectedArchetype.name}\n⏱ Time Remaining: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}\n📝 Word Count: ${wordCount}\n🎯 FINAL SCORE: ${finalScore}/10\n\n--- STUDENT ESSAY ---\n${essay}`;

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: message })
      });
    } catch (err) {
      console.error("Sync to HQ failed, but essay is saved in local state.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-red-500/30 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {state === 'WELCOME' && (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-screen p-6 max-w-4xl mx-auto">
            <div className="bg-zinc-900 border border-red-500/20 p-10 rounded-[2.5rem] shadow-2xl text-center backdrop-blur-md w-full">
              <div className="inline-flex w-20 h-20 bg-red-500/10 rounded-full items-center justify-center mb-6 border border-red-500/30">
                <AlertOctagon className="w-10 h-10 text-red-500 animate-pulse" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase text-white">CHẾ ĐỘ <span className="text-red-600">SINH TỒN 1A</span></h1>
              <p className="text-zinc-500 text-xs mb-8 uppercase tracking-[0.3em]">Water Usage Pie Charts • 17 Minutes • No Backspace</p>
              
              <div className="space-y-8 max-w-md mx-auto text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nhập danh tính</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tên chiến binh..." className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-red-500 focus:ring-2 focus:ring-red-500 transition-all outline-none font-bold placeholder:text-zinc-800" />
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {[
                    { id: 'warrior', icon: <Shield className="w-6 h-6" />, name: 'Warrior' },
                    { id: 'leader', icon: <Crown className="w-6 h-6" />, name: 'Leader' },
                    { id: 'sage', icon: <BookOpen className="w-6 h-6" />, name: 'Sage' },
                    { id: 'explorer', icon: <Compass className="w-6 h-6" />, name: 'Explorer' },
                  ].map(a => (
                    <button key={a.id} onClick={() => setSelectedArchetype(a)} className={`p-4 rounded-2xl border-2 transition-all flex justify-center ${selectedArchetype?.id === a.id ? 'border-red-600 bg-red-600/10 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]' : 'border-zinc-800 bg-zinc-950 text-zinc-600'}`}>
                      {a.icon}
                    </button>
                  ))}
                </div>

                <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-2xl space-y-2 text-center">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Lệnh Phạt (Cấm Sửa Chữa):</p>
                  <ul className="text-[11px] text-zinc-400 space-y-1 italic">
                    <li>Khóa Backspace/Delete. Sai là phải đi tiếp.</li>
                    <li>Đúng 150 từ = 10 điểm. Dưới 150 từ = 5 điểm.</li>
                    <li>Thời gian hành động: 17 Phút.</li>
                  </ul>
                </div>

                <button onClick={handleStart} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-lg shadow-red-900/20 flex items-center justify-center gap-3">
                  <Play size={20} fill="white" /> BẮT ĐẦU NHIỆM VỤ
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'QUIZ' && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-screen overflow-hidden">
            <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 p-4 flex justify-between items-center z-50 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-600/20">{selectedArchetype?.icon}</div>
                <div>
                  <h2 className="font-black uppercase text-sm text-white">{name}</h2>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                    <PieChart size={12} /> Task 1 Survival Feed
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-[8px] font-black uppercase text-zinc-500 mb-1 tracking-widest">Thời gian còn lại</p>
                  <div className={`flex items-center gap-2 px-6 py-2 rounded-xl border-2 font-mono text-2xl font-black transition-colors ${timeLeft < 60 ? 'border-red-600 text-red-500 animate-pulse' : 'border-zinc-700 text-white'}`}>
                    <Clock size={20} /> {formatTime(timeLeft)}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[8px] font-black uppercase text-zinc-500 mb-1 tracking-widest">Sản lượng từ</p>
                  <div className={`px-6 py-2 rounded-xl border-2 font-mono text-2xl font-black transition-colors ${wordCount >= MIN_WORDS ? 'border-emerald-600 text-emerald-500' : 'border-zinc-700 text-zinc-400'}`}>
                    {wordCount} / 150
                  </div>
                </div>
              </div>

              <button onClick={() => handleSubmit()} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-3 rounded-xl uppercase tracking-widest text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Nộp Báo Cáo</>}
              </button>
            </header>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-2/5 border-r border-zinc-800 bg-zinc-950 p-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800">
                    <h3 className="text-xs font-black uppercase text-red-500 mb-2 tracking-widest">Nhiệm vụ:</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed italic font-serif">
                      "The pie charts below show the percentage of water used for different purposes in a particular country in 2000 and 2010. Write at least 150 words."
                    </p>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-white p-6">
                    <img src="https://i.ibb.co/ccm1rYj0/water.png" alt="Water Usage Pie Charts" className="w-full h-auto object-contain" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>

              <div className="w-3/5 bg-black relative">
                <textarea
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="KHỞI ĐỘNG GÕ TẠI ĐÂY..."
                  className="w-full h-full bg-transparent p-12 text-xl font-serif leading-relaxed text-zinc-200 outline-none resize-none placeholder:text-zinc-900 selection:bg-red-500/20"
                  spellCheck={false}
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}

        {state === 'COMPLETION' && (
          <motion.div key="completion" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
             {wordCount >= MIN_WORDS ? (
               <Trophy size={100} className="text-yellow-500 mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]" />
             ) : (
               <AlertOctagon size={100} className="text-red-600 mb-6" />
             )}
             
             <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter text-white">
               {wordCount >= MIN_WORDS ? "NHIỆM VỤ HOÀN THÀNH" : "THẤT BẠI VỀ KHỐI LƯỢNG"}
             </h2>
             <p className="text-zinc-500 mb-10 max-w-md mx-auto text-lg italic font-serif leading-relaxed">
               Báo cáo đã được bắn thẳng về HQ. Điểm số được định đoạt dựa trên sự tuân thủ quy tắc 150 từ:
             </p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-12">
                <div className="bg-zinc-900 border-2 border-red-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2 relative z-10">Final Score</p>
                  <div className={`text-8xl font-black relative z-10 ${wordCount >= MIN_WORDS ? 'text-emerald-500' : 'text-red-500'}`}>
                    {wordCount >= MIN_WORDS ? '10' : '5'}<span className="text-zinc-700 text-3xl">/10</span>
                  </div>
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 ${wordCount >= MIN_WORDS ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </div>
                <div className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col justify-center">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">Word Count Achieved</p>
                  <div className="text-6xl font-black text-zinc-100">{wordCount}</div>
                  <p className="text-xs text-zinc-600 mt-2 font-bold uppercase tracking-tighter">Requirement: 150 words</p>
                </div>
             </div>

             <button onClick={handleBackToHQ} className="text-zinc-500 hover:text-white font-black uppercase tracking-widest underline underline-offset-8 transition-all hover:scale-110 active:scale-95 py-2">
                Return to Headquarters
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
