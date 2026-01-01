
import React, { useState, useEffect, createContext, useContext, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { X, Download, Loader2 } from 'lucide-react';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import { CheckedTicket } from './types';

// Lazy Load Pages
const Home = React.lazy(() => import('./pages/Home'));
const CheckTicket = React.lazy(() => import('./pages/CheckTicket'));
const History = React.lazy(() => import('./pages/History'));
const Settings = React.lazy(() => import('./pages/Settings'));
const ResultDetail = React.lazy(() => import('./pages/ResultDetail'));
const CheckResult = React.lazy(() => import('./pages/CheckResult'));
const CloseMiss = React.lazy(() => import('./pages/CloseMiss'));

// Theme Context
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: (newTheme: Theme) => void;
}
export const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

// PWA Context
interface PWAContextType {
  installPrompt: any;
  isInstalled: boolean;
  promptInstall: () => void;
}
export const PWAContext = createContext<PWAContextType>({ installPrompt: null, isInstalled: false, promptInstall: () => {} });
export const usePWA = () => useContext(PWAContext);

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center w-full h-full min-h-screen bg-slate-50 dark:bg-black text-emerald-500">
    <Loader2 size={32} className="animate-spin mb-2" />
    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading...</span>
  </div>
);

const AnimatedRoutes = ({ addToHistory, history }: { addToHistory: (t: CheckedTicket) => void, history: CheckedTicket[] }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <Suspense fallback={<LoadingFallback />}>
            <Home />
          </Suspense>
        } />
        <Route path="/check" element={
          <Suspense fallback={<LoadingFallback />}>
            <CheckTicket onChecked={addToHistory} />
          </Suspense>
        } />
        <Route path="/history" element={
          <Suspense fallback={<LoadingFallback />}>
            <History history={history} />
          </Suspense>
        } />
        <Route path="/settings" element={
          <Suspense fallback={<LoadingFallback />}>
            <Settings />
          </Suspense>
        } />
        <Route path="/draw/:id" element={
          <Suspense fallback={<LoadingFallback />}>
            <ResultDetail />
          </Suspense>
        } />
        <Route path="/result" element={
          <Suspense fallback={<LoadingFallback />}>
            <CheckResult />
          </Suspense>
        } />
        <Route path="/close-miss" element={
          <Suspense fallback={<LoadingFallback />}>
            <CloseMiss />
          </Suspense>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  // History State
  const [history, setHistory] = useState<CheckedTicket[]>(() => {
    try {
      const saved = localStorage.getItem('kl_lottery_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      // Check system preference if no local storage
      if (!localStorage.getItem('app_theme')) {
         return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return (localStorage.getItem('app_theme') as Theme) || 'light';
    } catch {
      return 'light';
    }
  });

  // PWA State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPopup, setShowInstallPopup] = useState(false);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      // Update meta theme color dynamically
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#000000');
    } else {
      root.classList.remove('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f8fafc');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  // Handle PWA Events
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setTimeout(() => setShowInstallPopup(true), 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setShowInstallPopup(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        setInstallPrompt(null);
        setShowInstallPopup(false);
      });
    }
  };

  const addToHistory = (ticket: CheckedTicket) => {
    const newHistory = [ticket, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('kl_lottery_history', JSON.stringify(newHistory));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: setTheme }}>
      <PWAContext.Provider value={{ installPrompt, isInstalled, promptInstall }}>
        <Router>
          {/* Main App Container - Fixes White Bars */}
          <div className="flex flex-col h-[100dvh] w-full bg-slate-50 dark:bg-black transition-colors duration-300">
            {/* Content Wrapper restricted to mobile width on desktop */}
            <div className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-50 dark:bg-black shadow-xl relative overflow-hidden">
              <main className="flex-1 overflow-y-auto no-scrollbar relative w-full">
                <ErrorBoundary>
                  <AnimatedRoutes addToHistory={addToHistory} history={history} />
                </ErrorBoundary>
              </main>
              <Navigation />

              {/* Install Popup Modal */}
              {showInstallPopup && installPrompt && (
                <div className="absolute bottom-20 left-4 right-4 bg-slate-900 dark:bg-zinc-800 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between z-50 animate-bounce-in">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500 p-2 rounded-xl">
                      <Download size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Install App</p>
                      <p className="text-xs text-slate-400">Add to home screen</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowInstallPopup(false)}
                      className="p-2 text-slate-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                    <button 
                      onClick={promptInstall}
                      className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide"
                    >
                      Install
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Router>
      </PWAContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;
