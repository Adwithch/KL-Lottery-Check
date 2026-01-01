
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, ScanLine } from 'lucide-react';
import { CloseMissResult } from '../services/lotteryService';
import { LotteryDraw } from '../types';
import PageTransition from '../components/PageTransition';

const CloseMiss: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state as { 
    closeMisses: CloseMissResult[], 
    ticketNumber: string, 
    draw: LotteryDraw 
  } | null;

  useEffect(() => {
    if (!state || !state.closeMisses) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  if (!state || !state.closeMisses) {
    return null;
  }

  const { closeMisses, ticketNumber } = state;

  const shuffleMisses = closeMisses.filter(m => m.missType === 'SHUFFLE');
  const oneMisses = closeMisses.filter(m => m.missType === 'ONE');
  const twoMisses = closeMisses.filter(m => m.missType === 'TWO');

  const renderTable = (title: string, items: CloseMissResult[], emptyMsg: string = "No matches found") => (
    <div className="mb-6 rounded-t-lg overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm">
      <div className="bg-emerald-600 p-2 text-center">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 p-3 text-center">
        <span className="font-bold text-slate-900 dark:text-white text-lg tracking-widest">{ticketNumber.toUpperCase()}</span>
      </div>
      <div className="bg-white dark:bg-zinc-900">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 border-b border-slate-100 dark:border-zinc-800 last:border-0">
              <span className="font-bold text-slate-900 dark:text-white text-lg tracking-wider w-1/3 text-left">
                {item.winningNumber}
              </span>
              <div className="flex-1 text-right">
                <span className="text-slate-500 dark:text-zinc-400 text-sm font-medium block">
                   {item.prizeCategory}
                </span>
                <span className="text-slate-500 dark:text-zinc-400 text-sm font-medium block">
                   ₹{item.prizeAmount.toLocaleString('en-IN')}/-
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-slate-400 dark:text-zinc-500 text-sm font-medium">
            {emptyMsg}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <PageTransition className="bg-slate-50 dark:bg-black pb-10">
      <header className="bg-emerald-600 p-4 flex items-center shadow-md sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 text-white hover:bg-emerald-700 rounded-full transition-colors mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-white">Just Miss Numbers</h1>
      </header>

      <div className="p-4 max-w-md mx-auto">
        {renderTable("Just Miss For Shuffle", shuffleMisses, "There's no match for your number.")}
        {renderTable("Just Miss For One Number", oneMisses)}
        {renderTable("Just Miss For Two Number", twoMisses)}

        <div className="mt-8 space-y-3">
           <button 
             onClick={() => navigate('/check')}
             className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
           >
             <ScanLine size={20} /> CHECK ANOTHER
           </button>
           <button 
             onClick={() => navigate('/')}
             className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2"
           >
             <LayoutDashboard size={18} /> DASHBOARD
           </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default CloseMiss;
