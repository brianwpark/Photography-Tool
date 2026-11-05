import React, { useState, useEffect } from 'react';
import PlannerView from './PlannerView.jsx';
import MoonTransitView from './MoonTransitView.jsx';
import SunView from './SunView.jsx';
import { Compass, Moon, Sun, Calendar, Crosshair } from 'lucide-react';
import { UPCOMING_ECLIPSES } from '../services/ephemeris.js';

export default function CelestialSuiteView({
  ephemData,
  transits,
  onOpenAR,
  userLocation,
  initialTab = 'planner'
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'planner', 'moon', 'sun', 'eclipses'

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-6">
      {/* Top Suite Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-brand-cyan/15 text-brand-cyan">
            <Compass size={20} />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Planner & Celestial Ephemeris Suite
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Combined astronomical tools: visual map planning, Sun/Moon desired sizes, TransitChaser & twilights
            </p>
          </div>
        </div>

        <div className="flex flex-wrap bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-mono self-start sm:self-auto gap-1">
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'planner'
                ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass size={13} />
            <span>Map Planner</span>
          </button>
          <button
            onClick={() => setActiveTab('moon')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'moon' || activeTab === 'transits' || activeTab === 'transit-chaser'
                ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crosshair size={13} />
            <span>Transit Chaser</span>
          </button>
          <button
            onClick={() => setActiveTab('sun')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'sun'
                ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun size={13} />
            <span>Sun & Twilights</span>
          </button>
          <button
            onClick={() => setActiveTab('eclipses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'eclipses'
                ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar size={13} />
            <span>Eclipses</span>
          </button>
        </div>
      </div>

      {/* Render selected tool */}
      {activeTab === 'planner' && (
        <PlannerView
          onSelectView={view => setActiveTab((view === 'moon-transit' || view === 'transit-chaser') ? 'moon' : view)}
          userLocation={userLocation}
          isEmbedded
        />
      )}
      {(activeTab === 'moon' || activeTab === 'transits' || activeTab === 'transit-chaser') && (
        <MoonTransitView
          ephemData={ephemData}
          transits={transits}
          onOpenAR={onOpenAR}
          userLocation={userLocation}
          isEmbedded
        />
      )}
      {activeTab === 'sun' && <SunView ephemData={ephemData} isEmbedded />}
      {activeTab === 'eclipses' && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-brand-amber" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Upcoming Solar & Lunar Eclipses
            </h2>
          </div>
          <div className="space-y-3">
            {UPCOMING_ECLIPSES.map((e, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{e.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-brand-amber/20 text-brand-amber border border-brand-amber/40 font-bold">
                      {e.type}
                    </span>
                  </div>
                  <span className="text-slate-400 block mt-1">Date: {e.date} · Max Duration: {e.duration} · Magnitude: {e.magnitude}</span>
                  <span className="text-slate-400 block mt-0.5 font-sans">Visibility: {e.visibility}</span>
                </div>
                <button
                  onClick={() => setActiveTab('planner')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-cyan border border-brand-cyan/30 self-start sm:self-auto"
                >
                  Plan on Map &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
