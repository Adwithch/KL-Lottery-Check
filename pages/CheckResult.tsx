
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowLeft, Share2, Search, Zap, Info, Download, Loader2 } from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';
// @ts-ignore
import html2canvas from 'html2canvas';
import { CheckedTicket, LotteryDraw } from '../types';
import { Logo } from '../components/Logo';
import PageTransition from '../components/PageTransition';

const CheckResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const captureRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const state = location.state as { 
    result: CheckedTicket, 
    draw: LotteryDraw, 
    closeMisses: any[] 
  } | null;

  const playWinSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // Cheerful Major Chord Arpeggio
      const notes = [
        { freq: 523.25, time: 0, dur: 0.6 },
        { freq: 659.25, time: 0.1, dur: 0.6 },
        { freq: 783.99, time: 0.2, dur: 0.6 },
        { freq: 1046.50, time: 0.3, dur: 1.2 }
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const startTime = now + time;
        osc.start(startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
        osc.stop(startTime + dur);
      });
    } catch (e) {
      console.error("Audio playback failed:", e);
    }
  };

  useEffect(() => {
    if (!state || !state.result) {
      navigate('/', { replace: true });
      return;
    }

    if (state.result.status === 'WIN') {
      playWinSound();
      
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [state, navigate]);

  const captureScreen = async () => {
    if (!captureRef.current) return null;
    setIsCapturing(true);
    try {
      // Small delay to ensure state updates (like removing overflow hidden if needed)
      await new Promise(r => setTimeout(r, 100));
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        backgroundColor: null, // Transparent to pick up the container's background
        useCORS: true,
        logging: false
      });
      setIsCapturing(false);
      return canvas;
    } catch (error) {
      console.error("Capture failed:", error);
      setIsCapturing(false);
      return null;
    }
  };

  const handleDownload = async () => {
    const canvas = await captureScreen();
    if (canvas) {
      const link = document.createElement('a');
      link.download = `KL-Lottery-Result-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleShare = async () => {
    const canvas = await captureScreen();
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const file = new File([blob], "result.png", { type: "image/png" });
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'My Lottery Result',
            text: 'Checked with KL Lottery Check App',
            files: [file]
          });
        } catch (err) {
          console.error("Share failed", err);
          handleDownload(); // Fallback
        }
      } else {
        handleDownload();
      }
    }, 'image/png');
  };

  if (!state || !state.result) return null;

  const { result, draw, closeMisses } = state;
  const isWin = result.status === 'WIN';

  return (
    <PageTransition className={`pb-10 ${isWin ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : 'bg-slate-50/50 dark:bg-black'}`}>
      <header className="p-6 flex items-center justify-between sticky top-0 z-10 bg-transparent">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Result</h1>
        <div className="flex gap-2">
          <button 
            onClick={handleDownload}
            disabled={isCapturing}
            className="p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
          >
            {isCapturing ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} />}
          </button>
          <button 
            onClick={handleShare}
            disabled={isCapturing}
            className="p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
          >
            <Share2 size={24} />
          </button>
        </div>
      </header>

      {/* Capture Container */}
      <div ref={captureRef} className={`px-6 py-8 flex flex-col items-center text-center ${isWin ? 'bg-emerald-50/10' : 'bg-slate-50/10'}`}>
        {isWin ? (
          <div className="mb-8 scale-100 animate-pulse-slow">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-emerald-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <CheckCircle2 size={120} className="text-emerald-500 relative z-10" strokeWidth={1.5} />
              <div className="absolute -top-6 -right-4 text-4xl animate-bounce">🎉</div>
              <div className="absolute -bottom-2 -left-4 text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎊</div>
              <div className="absolute top-0 -left-6 text-2xl animate-ping" style={{ animationDelay: '0.5s' }}>⭐</div>
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Winner!</h2>
            <div className="flex flex-col items-center gap-1">
               <span className="text-slate-400 dark:text-zinc-500 font-bold uppercase text-xs tracking-widest">Est. Prize</span>
               <p className="text-6xl font-black text-emerald-600 dark:text-emerald-400 drop-shadow-sm">₹{result.prizeAmount?.toLocaleString('en-IN')}</p>
               <span className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-wider shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50">
                 🏆 {result.prizeCategory}
               </span>
            </div>
          </div>
        ) : (
          <div className="mb-8">
             <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-slate-400 rounded-full blur-2xl opacity-10"></div>
              <XCircle size={120} className="text-slate-300 dark:text-zinc-700 relative z-10" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">No Winning Match</h2>
            <p className="text-slate-500 dark:text-zinc-400 font-medium px-10">
              Ticket <span className="text-slate-900 dark:text-white font-bold">#{result.ticketNumber}</span> did not win this time.
            </p>
          </div>
        )}

        <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-sm space-y-4 mb-8">
          <div className="flex justify-between items-center pb-4 border-b border-slate-50 dark:border-zinc-800">
             <div className="text-left">
               <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Ticket</span>
               <p className="text-lg font-black text-slate-900 dark:text-white tracking-wider">{result.ticketNumber.toUpperCase()}</p>
             </div>
             <div className="w-10 h-10 bg-slate-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-slate-300 dark:text-zinc-600">
               <Info size={20} />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="text-left">
               <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Draw Date</span>
               <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">{new Date(result.drawDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
             </div>
             <div className="text-right">
               <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Lottery</span>
               <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">{result.lotteryName}</p>
             </div>
          </div>
        </div>

        {!isWin && closeMisses.length > 0 && (
          <div className="w-full bg-slate-900 dark:bg-zinc-900 border border-slate-800 rounded-3xl p-6 text-white text-left relative overflow-hidden mb-8">
            <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12">
               <Zap size={120} />
            </div>
            <div className="flex items-center gap-2 mb-2">
               <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
                 <Zap size={16} />
               </div>
               <h4 className="font-bold text-emerald-400">Close Miss Detected!</h4>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
               You were very close to winning. Check the details to see how many digits missed!
            </p>
          </div>
        )}

        {/* Branding Footer for Screenshots */}
        <div className="mt-4 flex flex-col items-center opacity-60 grayscale">
          <Logo size={32} />
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] mt-2">Verified by KL Lottery Check</span>
        </div>
      </div>

      <div className="px-6 pb-8 w-full space-y-4">
           <button 
             onClick={() => navigate(`/draw/${draw.id}`)}
             className="w-full bg-emerald-500 text-white font-black py-5 rounded-2xl shadow-lg shadow-emerald-100 dark:shadow-none flex items-center justify-center gap-2"
           >
             <Search size={20} /> VIEW FULL RESULTS
           </button>
           
           <div className="grid grid-cols-2 gap-4">
             {!isWin && closeMisses.length > 0 && (
                <button 
                  onClick={() => navigate('/close-miss', { state: { closeMisses, ticketNumber: result.ticketNumber, draw } })}
                  className="bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
                >
                  <Zap size={18} className="text-yellow-500" /> CLOSE MISS
                </button>
             )}
             <button 
               onClick={() => navigate('/check')}
               className={`bg-white dark:bg-zinc-900 border-2 border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 ${(!isWin && closeMisses.length > 0) ? '' : 'col-span-2'}`}
             >
               CHECK ANOTHER
             </button>
           </div>
      </div>
    </PageTransition>
  );
};

export default CheckResult;
