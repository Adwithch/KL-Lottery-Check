
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Share2, Award, Ticket, CheckCircle, Smartphone, ExternalLink } from 'lucide-react';
import { getDrawById } from '../services/lotteryService';
import { LotteryDraw } from '../types';
import PageTransition from '../components/PageTransition';

const ResultDetail: React.FC = () => {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const draw = (location.state as any)?.draw as LotteryDraw || getDrawById(idParam || '');
  const [searchTerm, setSearchTerm] = useState('');

  if (!draw) return <div className="p-8 text-center text-slate-500 dark:text-zinc-400">Draw details not available. Please try again.</div>;

  return (
    <PageTransition className="bg-slate-50 dark:bg-black">
      <header className="bg-white dark:bg-black p-6 sticky top-0 z-10 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{draw.name}</h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{draw.series}-{draw.drawNumber} • {new Date(draw.date).toDateString()}</p>
          </div>
          <button className="p-2 -mr-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
            <Share2 size={24} />
          </button>
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Search winning number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
        </div>
      </header>

      <div className="p-6 space-y-8 pb-32">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Award className="text-emerald-500" size={20} />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Top Prizes</h2>
          </div>
          
          <div className="space-y-4">
            {draw.prizes.slice(0, 3).map((prize, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                 {idx === 0 && <div className="absolute top-0 right-0 p-3"><CheckCircle size={32} className="text-emerald-100 dark:text-emerald-900/30" strokeWidth={1.5} /></div>}
                 <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">{prize.category}</span>
                 <div className="flex flex-col gap-2 mt-2">
                   {prize.numbers.map((num, nIdx) => (
                     <p key={nIdx} className={`font-black tracking-widest ${idx === 0 ? 'text-4xl text-slate-900 dark:text-white' : 'text-2xl text-slate-700 dark:text-zinc-200'}`}>
                       {num}
                     </p>
                   ))}
                 </div>
                 <div className="mt-4 pt-4 border-t border-slate-50 dark:border-zinc-800 flex justify-between items-center">
                   <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{prize.amount.toLocaleString('en-IN')}</span>
                 </div>
              </div>
            ))}
          </div>
        </section>

        {draw.prizes.length > 3 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ticket className="text-emerald-500" size={20} />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Other Winning Numbers</h2>
              </div>
            </div>

            <div className="space-y-6">
              {draw.prizes.slice(3).map((prize, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-zinc-800 pb-2">
                    <h3 className="font-bold text-slate-500 dark:text-zinc-400 text-sm">{prize.category} (₹{prize.amount.toLocaleString('en-IN')})</h3>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {prize.numbers.map((num, nIdx) => (
                      <div 
                        key={nIdx} 
                        className={`bg-white dark:bg-zinc-900 py-3 rounded-2xl border border-slate-100 dark:border-zinc-800 text-center font-black text-slate-700 dark:text-zinc-200 shadow-sm transition-all ${searchTerm && num.includes(searchTerm) ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {draw.sources && draw.sources.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ExternalLink className="text-emerald-500" size={20} />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Data Sources</h2>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm p-4 space-y-2">
              {draw.sources.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  <ExternalLink size={12} />
                  <span className="truncate">{source.title || 'Official Source'}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <div className="p-8 border-t border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-4">
           <p className="text-xs font-medium text-slate-400 dark:text-zinc-600 leading-relaxed italic">
             Results are sourced via official channels.
           </p>
           <button 
             onClick={() => navigate('/check')}
             className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
           >
             <Smartphone size={16} /> Scan My Ticket
           </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResultDetail;
