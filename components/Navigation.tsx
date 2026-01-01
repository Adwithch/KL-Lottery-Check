
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, History, Settings, Camera } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/check', label: 'Check', icon: Search },
    { path: '/history', label: 'History', icon: History },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-slate-100 dark:border-zinc-800 px-6 py-3 flex justify-between items-center z-50 transition-colors">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive(item.path) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-600'
          }`}
        >
          <item.icon size={22} strokeWidth={isActive(item.path) ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
      
      {!location.pathname.includes('/check') && (
        <Link 
          to="/check" 
          className="absolute -top-14 right-6 bg-emerald-500 text-white p-4 rounded-full shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95 transition-transform"
        >
          <Camera size={24} />
        </Link>
      )}
    </div>
  );
};

export default Navigation;
