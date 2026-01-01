
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ChevronRight, Award, Trash2 } from 'lucide-react';
import { CheckedTicket } from '../types';
import PageTransition from '../components/PageTransition';

interface HistoryProps {
  history: CheckedTicket[];
}

const History: React.FC<HistoryProps> = ({ history }) => {
  const navigate = useNavigate();

  return (
    <PageTransition className="p-6 bg-white dark:bg-black">
      <header className="flex items-center mb-8 relative">
        <button onClick={() => navigate(-1)} className="absolute left-0 p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="w-full text-center text-xl font-bold text-slate-900 dark:text-white">History</h1>
      </header>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
           <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
             <Clock size={40} className="text-slate-400 dark:text-zinc-600" />
           </div>
           <p className="font-bold text-slate-900 dark:text-white">No history yet</p>
           <p className="text-sm mt-1 text-slate-500 dark:text-zinc-500">Checked tickets will appear here.</p>
           <button 
             onClick={() => navigate('/check')}
             className="mt-8 bg-slate-900 dark:bg-zinc-800 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
           >
             Check Now
           </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{history.length} Recent Checks</span>
            <button className="text-red-400 p-1"><Trash2 size={16} /></button>
          </div>
          
          {history.map((ticket) => (
            <div 
              key={ticket.id}
              className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-100 dark:border-zinc-800 flex items-center gap-4 group shadow-sm"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ticket.status === 'WIN' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'}`}>
                {ticket.status === 'WIN' ? <Award size={24} /> : <TicketIcon size={24} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{ticket.ticketNumber.toUpperCase()}</h4>
                  {ticket.status === 'WIN' && <span className="text-[8px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">WINNER</span>}
                </div>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold mt-1 uppercase tracking-wider">
                  {ticket.lotteryName} • {new Date(ticket.drawDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-300 dark:text-zinc-600 font-medium mb-1">
                  {new Date(ticket.timestamp).toLocaleDateString()}
                </p>
                <ChevronRight size={18} className="text-slate-200 dark:text-zinc-700 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-slate-50 dark:bg-zinc-900/50 rounded-3xl border border-slate-100 dark:border-zinc-800">
         <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Did You Win?</h4>
         <p className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed font-medium">
           If your ticket is a winner, visit the official lottery directorate or a licensed bank with your ticket and valid ID to claim. Smaller prizes (under ₹5,000) can usually be claimed at any licensed retailer.
         </p>
      </div>
    </PageTransition>
  );
};

const TicketIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
  </svg>
);

export default History;
