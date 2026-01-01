
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Info, ShieldAlert, Share2, FileText, Heart, Download, X, Instagram } from 'lucide-react';
import { usePWA } from '../App';
import { Logo } from '../components/Logo';
import PageTransition from '../components/PageTransition';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { installPrompt, promptInstall, isInstalled } = usePWA();
  
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTos, setShowTos] = useState(false);

  return (
    <PageTransition className="p-6 bg-slate-50 dark:bg-black">
      <header className="flex items-center mb-8 relative">
        <button onClick={() => navigate(-1)} className="absolute left-0 p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="w-full text-center text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
      </header>

      <section className="mb-8">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/50 flex gap-4">
           <div className="text-emerald-500 shrink-0">
             <ShieldCheck size={24} />
           </div>
           <div>
             <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">Official Disclaimer</h4>
             <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed font-medium">
               We strive for 100% accuracy. However, please always verify your ticket with the official Kerala Lottery gazette before discarding.
             </p>
           </div>
        </div>
      </section>

      <div className="space-y-8">
        {/* App Install Section - Only show if PWA available */}
        {installPrompt && !isInstalled && (
          <section>
            <h2 className="text-xs font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Install App</h2>
            <button 
              onClick={promptInstall}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-5 rounded-3xl flex items-center justify-between shadow-lg active:scale-95 transition-all"
            >
              <div className="flex items-center gap-4">
                 <div className="p-2 bg-slate-800 dark:bg-zinc-100 rounded-xl"><Download size={20} /></div>
                 <div className="text-left">
                   <span className="font-bold block">Install Application</span>
                   <span className="text-xs opacity-70">Add to home screen</span>
                 </div>
              </div>
            </button>
          </section>
        )}

        <section>
          <h2 className="text-xs font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-4">About & Legal</h2>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 divide-y divide-slate-50 dark:divide-zinc-800 shadow-sm overflow-hidden">
             <div className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
               <div className="flex items-center gap-4">
                 <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-xl"><Info size={20} /></div>
                 <span className="font-bold text-slate-700 dark:text-zinc-200">App Info</span>
               </div>
               <span className="text-[10px] font-bold text-slate-300 dark:text-zinc-600">v1.0.5</span>
             </div>
             <button onClick={() => setShowPrivacy(true)} className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
               <div className="flex items-center gap-4">
                 <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-xl"><ShieldAlert size={20} /></div>
                 <span className="font-bold text-slate-700 dark:text-zinc-200">Privacy Policy</span>
               </div>
             </button>
             <button onClick={() => setShowTos(true)} className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
               <div className="flex items-center gap-4">
                 <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-500 rounded-xl"><FileText size={20} /></div>
                 <span className="font-bold text-slate-700 dark:text-zinc-200">Terms of Service</span>
               </div>
             </button>
             <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
               <div className="flex items-center gap-4">
                 <div className="p-2 bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-xl"><Share2 size={20} /></div>
                 <span className="font-bold text-slate-700 dark:text-zinc-200">Share App</span>
               </div>
             </button>
          </div>
        </section>

        <footer className="pt-8 pb-12 text-center">
           <div className="flex flex-col items-center justify-center gap-2 mb-6">
             <Logo size={48} />
             <div className="flex flex-col items-center -mt-1">
               <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">KL Lottery</span>
               <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.4em]">Check</span>
             </div>
           </div>

           <div className="flex flex-col items-center gap-5">
             <a 
               href="https://www.instagram.com/a.dwith?igsh=MXdyeXU5cDM5YW5oeQ==" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center gap-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider shadow-lg shadow-pink-500/30 hover:shadow-xl active:scale-95 transition-all"
             >
               <Instagram size={18} /> Follow A.dwith
             </a>
             
             <p className="text-[10px] text-slate-400 dark:text-zinc-600 font-bold flex items-center justify-center gap-1">
               Made with <Heart size={10} className="text-red-500 fill-red-500 animate-pulse" /> By A.dwith for Kerala
             </p>
           </div>
        </footer>
      </div>

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md h-[80vh] sm:h-auto sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl animate-in slide-in-from-bottom">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-lg dark:text-white">Privacy Policy</h3>
              <button onClick={() => setShowPrivacy(false)} className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full"><X size={20} className="dark:text-white" /></button>
            </div>
            <div className="p-6 overflow-y-auto prose dark:prose-invert text-sm">
              <p><strong>Last Updated: May 2024</strong></p>
              <p>KL Lottery Check ("we", "our", or "us") respects your privacy. This Privacy Policy explains how we collect and use your information.</p>
              <h4>1. Information We Collect</h4>
              <p>We do not collect any personal identification information. We may process image data locally on your device if you use the ticket scanning feature. This image data is processed via API for extraction but is not stored permanently by us.</p>
              <h4>2. Local Storage</h4>
              <p>We use local storage on your device to save your check history and app preferences (like theme). This data never leaves your device.</p>
              <h4>3. Third-Party Services</h4>
              <p>We fetch lottery results from publicly available sources. We do not guarantee the uptime or accuracy of these external sources.</p>
              <h4>4. Camera Usage</h4>
              <p>We require camera access solely for the purpose of scanning lottery tickets. No video is recorded or transmitted to third parties for surveillance.</p>
            </div>
          </div>
        </div>
      )}

      {/* TOS Modal */}
      {showTos && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md h-[80vh] sm:h-auto sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl animate-in slide-in-from-bottom">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-lg dark:text-white">Terms of Service</h3>
              <button onClick={() => setShowTos(false)} className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full"><X size={20} className="dark:text-white" /></button>
            </div>
            <div className="p-6 overflow-y-auto prose dark:prose-invert text-sm">
              <h4>1. Acceptance of Terms</h4>
              <p>By using KL Lottery Check, you agree to these terms.</p>
              <h4>2. No Gambling</h4>
              <p><strong>Important:</strong> This app is strictly for information purposes only. We DO NOT sell lottery tickets. We DO NOT facilitate any form of gambling. You cannot win money directly from this app.</p>
              <h4>3. Accuracy of Information</h4>
              <p>While we aim for precision, results provided in this app are for reference only. You must verify your winning ticket with the official Kerala Government Gazette or an authorized dealer before discarding any ticket.</p>
              <h4>4. Liability</h4>
              <p>We are not liable for any financial loss or damages arising from the use of this app or reliance on the information provided herein.</p>
            </div>
          </div>
        </div>
      )}

    </PageTransition>
  );
};

export default Settings;
