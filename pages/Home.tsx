import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, ChevronRight, RefreshCw, Loader2, WifiOff } from 'lucide-react';
import { fetchHistory } from '../services/lotteryService';
import { LotteryDraw } from '../types';
import { Logo } from '../components/Logo';
import PageTransition from '../components/PageTransition';

const SkeletonDraw = () => (
  <div className="w-full bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 flex items-center gap-4">
    <div className="w-12 h-12 bg-slate-200 dark:bg-zinc-800 rounded-xl animate-pulse"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-3/4 animate-pulse"></div>
      <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-1/2 animate-pulse"></div>
    </div>
    <div className="w-5 h-5 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse"></div>
  </div>
);

const Home: React.FC = () => {
  const [draws, setDraws] = useState<LotteryDraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  const navigate = useNavigate();
  const observerTarget = useRef<HTMLDivElement>(null);
  const LIMIT = 15;

  const loadInitialData = async () => {
    // 1. Load from cache first for instant UI
    const cached = localStorage.getItem('draws_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setDraws(parsed);
        setLoading(false); // Show cached data immediately
      } catch (e) {}
    }

    // 2. Then fetch fresh data
    try {
      const data = await fetchHistory(LIMIT, 0);
      if (data && data.length > 0) {
        setDraws(data);
        localStorage.setItem('draws_cache', JSON.stringify(data)); // Update cache
        setOffset(LIMIT);
        setHasMore(data.length === LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.warn("Fetch failed, relying on cache");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (fetchingMore || !hasMore) return;
    
    setFetchingMore(true);
    const data = await fetchHistory(LIMIT, offset);
    if (data && data.length > 0) {
      setDraws(prev => [...prev, ...data]);
      setOffset(prev => prev + LIMIT);
      if (data.length < LIMIT) setHasMore(false);
    } else {
      setHasMore(false);
    }
    setFetchingMore(false);
  }, [offset, hasMore, fetchingMore]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !fetchingMore) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => observer.disconnect();
  }, [hasMore, loading, fetchingMore, loadMore]);

  const latestDraw = draws[0];

  return (
    <PageTransition className="p-6 pb-24 bg-slate-50 dark:bg-black">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Logo size={42} />
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">KL Lottery</h1>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Check</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setLoading(true); loadInitialData(); }} className="p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => navigate('/settings')} className="p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
            <SettingsIcon size={24} />
          </button>
        </div>
      </header>

      {loading && draws.length === 0 ? (
        <div className="space-y-6">
          <div className="h-48 bg-slate-200 dark:bg-zinc-800 rounded-3xl animate-pulse"></div>
          <div className="space-y-4">
             <SkeletonDraw />
             <SkeletonDraw />
             <SkeletonDraw />
             <SkeletonDraw />
          </div>
        </div>
      ) : draws.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <WifiOff className="text-slate-300 dark:text-zinc-700 mb-6" size={64} />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Connection Issue</h2>
          <p className="text-slate-500 dark:text-zinc-500 mt-2 mb-6 max-w-xs">We couldn't load the lottery results. Please check your connection and try again.</p>
          <button 
            onClick={loadInitialData}
            className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95 transition-transform"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <>
          {latestDraw && (
            <section className="mb-8">
              <h2 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Latest Result</h2>
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-emerald-200/50 dark:shadow-none text-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                
                <div className="flex items-center gap-2 mb-2 relative z-10">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                  <span className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Confirmed</span>
                </div>
                
                <h3 className="text-3xl font-black mb-1 relative z-10">{latestDraw.name} {latestDraw.id}</h3>
                <p className="text-emerald-100/80 mb-6 font-medium relative z-10">
                  {new Date(latestDraw.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                
                <button 
                  onClick={() => navigate(`/draw/${latestDraw.id}`, { state: { draw: latestDraw } })}
                  className="w-full bg-white text-emerald-800 font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform relative z-10 shadow-lg"
                >
                  VIEW FULL PRIZE LIST <ChevronRight size={18} />
                </button>
              </div>
            </section>
          )}

          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Recent History</h2>
            </div>

            <div className="space-y-4">
              {draws.slice(1).map((draw) => (
                <button
                  key={draw.id}
                  onClick={() => navigate(`/draw/${draw.id}`, { state: { draw } })}
                  className="w-full bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 flex items-center gap-4 hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors group shadow-sm animate-in fade-in slide-in-from-bottom-2"
                >
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                    <span className="text-xs font-black">{draw.id.split('-')[0]}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-slate-900 dark:text-zinc-100 leading-tight">{draw.name} {draw.id}</h4>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-tighter">
                      {new Date(draw.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-slate-200 dark:text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                </button>
              ))}
            </div>

            <div ref={observerTarget} className="py-8 flex justify-center">
              {fetchingMore && <Loader2 className="animate-spin text-emerald-500" size={24} />}
              {!hasMore && draws.length > 0 && (
                <p className="text-xs text-slate-400 dark:text-zinc-600 font-medium uppercase tracking-widest">End of History</p>
              )}
            </div>
          </section>
        </>
      )}
    </PageTransition>
  );
};

export default Home;