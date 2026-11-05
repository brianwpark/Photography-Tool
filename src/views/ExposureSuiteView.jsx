import React, { useState, useEffect } from 'react';
import NdTimerView from './NdTimerView.jsx';
import ExposureView from './ExposureView.jsx';
import TimerView from './TimerView.jsx';
import { Timer, Layers, Sliders, Clock } from 'lucide-react';

export default function ExposureSuiteView({ initialTab = 'nd-timer' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'nd-timer', 'exposure', 'timer'

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-6">
      {/* Top Suite Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-brand-amber/15 text-brand-amber">
            <Timer size={20} />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Exposure, ND Filters & Timing Suite
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Combined exposure tools: ND stacking reciprocity, test shot conversion & countdown timers
            </p>
          </div>
        </div>

        <div className="flex flex-wrap bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-mono self-start sm:self-auto gap-1">
          <button
            onClick={() => setActiveTab('nd-timer')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'nd-timer'
                ? 'bg-brand-amber text-slate-950 font-bold shadow-[0_0_12px_rgba(252,163,17,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>ND Filter Stacker</span>
          </button>
          <button
            onClick={() => setActiveTab('exposure')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'exposure'
                ? 'bg-brand-amber text-slate-950 font-bold shadow-[0_0_12px_rgba(252,163,17,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders size={13} />
            <span>Equivalent Exposure</span>
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'timer'
                ? 'bg-brand-amber text-slate-950 font-bold shadow-[0_0_12px_rgba(252,163,17,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock size={13} />
            <span>Field Countdown Timer</span>
          </button>
        </div>
      </div>

      {/* Render selected tool */}
      {activeTab === 'nd-timer' && <NdTimerView isEmbedded />}
      {activeTab === 'exposure' && <ExposureView onSelectView={() => setActiveTab('timer')} isEmbedded />}
      {activeTab === 'timer' && <TimerView isEmbedded />}
    </div>
  );
}
