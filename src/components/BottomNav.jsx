import React from 'react';
import { LayoutDashboard, Focus, Timer, Sparkles, Moon, Menu } from 'lucide-react';

export default function BottomNav({ activeView, onSelectView, onToggleMenu }) {
  const navItems = [
    { id: 'dashboard', label: 'Hub', icon: LayoutDashboard },
    { id: 'dof', label: 'DoF', icon: Focus },
    { id: 'nd-timer', label: 'ND Timer', icon: Timer },
    { id: 'spot-stars', label: 'Astro', icon: Sparkles },
    { id: 'moon-transit', label: 'Moon', icon: Moon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#080d16]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-2 md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-lg transition-all ${
                isActive
                  ? 'text-brand-cyan scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span className="text-[10px] font-medium tracking-tight mt-1">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* All Tools Menu Button */}
        <button
          onClick={onToggleMenu}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 text-slate-400 hover:text-slate-200"
        >
          <Menu size={20} className="stroke-[1.8]" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Tools</span>
        </button>
      </div>
    </nav>
  );
}
