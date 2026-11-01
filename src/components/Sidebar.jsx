import React from 'react';
import {
  LayoutDashboard,
  Focus,
  Table,
  Timer,
  Sparkles,
  Video,
  Orbit,
  Maximize2,
  Moon,
  Sun,
  Flame,
  Ruler,
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
    category: 'Optics & Focus',
    items: [
      { id: 'dof', label: 'Depth of Field & Hyperfocal', icon: Focus },
      { id: 'dof-table', label: 'DoF & Hyperfocal Matrix', icon: Table },
      { id: 'fov', label: 'Field of View & Sensor Crop', icon: Maximize2 },
      { id: 'subject-distance', label: 'Subject Distance Calculator', icon: Ruler }
    ]
  },
  {
    category: 'Exposure & ND Filters',
    items: [
      { id: 'nd-timer', label: 'Exposure & ND Filter Timer', icon: Timer, badge: 'Bulb' },
      { id: 'sun', label: 'Sun, Golden Hour & Shadows', icon: Sun }
    ]
  },
  {
    category: 'Astrophotography & Motion',
    items: [
      { id: 'moon-transit', label: 'Moon & TransitChaser', icon: Moon, badge: 'ISS/Aero' },
      { id: 'spot-stars', label: 'Spot Stars (500 / NPF)', icon: Sparkles },
      { id: 'timelapse', label: 'Hyperlapse & Timelapse', icon: Video },
      { id: 'star-trails', label: 'Star Trails Arc Calculator', icon: Orbit },
      { id: 'meteor-showers', label: 'Meteor Showers Calendar', icon: Flame }
    ]
  },
  {
    category: 'Augmented Reality',
    items: [
      { id: 'ar-viewfinder', label: 'AR Viewfinder HUD', icon: Camera, isAction: true }
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
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 shadow-[0_0_12px_rgba(18,214,199,0.15)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={17} className={isActive ? 'text-brand-cyan' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      item.badge === 'ISS/Aero'
                        ? 'bg-brand-amber/20 text-brand-amber border border-brand-amber/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
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
      {/* Desktop / Tablet Persistent Sidebar */}
      <aside className="hidden md:block w-72 flex-shrink-0 border-r border-white/10 bg-[#080d16]/60 backdrop-blur-md p-4 min-h-[calc(100vh-61px)]">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Slide-out Drawer */}
          <div className="relative w-80 max-w-[85%] bg-[#080d16] border-r border-white/10 p-5 h-full overflow-y-auto z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <span className="font-bold text-base text-white">Photography Tools</span>
                <button
                  onClick={onCloseMobile}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              {navContent}
            </div>

            <div className="pt-4 border-t border-white/10 text-xs font-mono text-slate-500">
              AstroPro v1.0 • Field Ready
            </div>
          </div>
        </div>
      )}
    </>
  );
}
