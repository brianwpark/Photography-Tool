import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Focus,
  Maximize2,
  Timer,
  Sparkles,
  Camera,
  X
} from 'lucide-react';

export const MENU_GROUPS = [
  {
    category: 'Field Overview',
    items: [
      { id: 'dashboard', label: 'Field Hub (Dashboard)', icon: LayoutDashboard, badge: 'Live' }
    ]
  },
  {
    category: 'Core Photography Suites',
    items: [
      {
        id: 'celestial',
        label: 'Planner & Ephemeris',
        sublabel: 'Map, Sun, Moon & TransitChaser',
        icon: Compass,
        badge: 'Transits'
      },
      {
        id: 'dof',
        label: 'Depth of Field & Focus',
        sublabel: 'DoF Calculator & Hyperfocal Matrix',
        icon: Focus
      },
      {
        id: 'fov',
        label: 'Field of View & Framing',
        sublabel: 'FoV, 2-Camera Match & Subject Dist',
        icon: Maximize2
      },
      {
        id: 'exposure',
        label: 'Exposure, ND & Timers',
        sublabel: 'ND Stacker, Test Reciprocity & Timer',
        icon: Timer,
        badge: 'Bulb'
      },
      {
        id: 'astrophotography',
        label: 'Astrophotography & Night',
        sublabel: 'Spot Stars, Star Trails & Timelapse',
        icon: Sparkles
      }
    ]
  },
  {
    category: 'Augmented Reality',
    items: [
      {
        id: 'ar-viewfinder',
        label: 'Night AR & Viewfinder HUD',
        sublabel: 'Milky Way, Polaris & Celestial Lock',
        icon: Camera,
        isAction: true,
        badge: 'Night AR'
      }
    ]
  }
];

export default function Sidebar({
  activeView,
  onSelectView,
  isMobileOpen,
  onCloseMobile,
  onOpenAR
}) {
  const handleItemClick = (item) => {
    if (item.isAction) {
      onOpenAR();
    } else {
      onSelectView(item.id);
    }
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <div className="space-y-6">
      {MENU_GROUPS.map((group, groupIdx) => (
        <div key={groupIdx}>
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold px-3 mb-2">
            {group.category}
          </h3>
          <div className="space-y-1.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 shadow-[0_0_12px_rgba(18,214,199,0.15)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <Icon size={18} className={isActive ? 'text-brand-cyan' : 'text-slate-400'} />
                    <div>
                      <div className="leading-tight font-semibold">{item.label}</div>
                      {item.sublabel && (
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[170px]">
                          {item.sublabel}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        isActive
                          ? 'bg-brand-cyan/20 text-brand-cyan'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-72 flex-shrink-0 pr-6 py-6 border-r border-white/5 select-none">
        {navContent}
      </aside>

      {/* Mobile Drawer Navigation */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex select-none">
          {/* Backdrop */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
          />

          {/* Drawer Body */}
          <div className="relative w-80 max-w-[85%] bg-[#080d16] border-r border-white/10 p-5 h-full overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <span className="font-bold text-base text-white tracking-tight">Navigation Menu</span>
                <button 
                  onClick={onCloseMobile}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              {navContent}
            </div>

            <div className="pt-4 border-t border-white/10 text-center">
              <span className="text-[11px] font-mono text-slate-500">AstroPro Photography Field Suite</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
