import React, { useState, useEffect } from 'react';
import FovView from './FovView.jsx';
import FocalLengthMatchView from './FocalLengthMatchView.jsx';
import SubjectDistanceView from './SubjectDistanceView.jsx';
import { Maximize2, RefreshCw, Ruler } from 'lucide-react';

export default function FovSuiteView({ initialTab = 'fov' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'fov', 'focal-match', 'subject-distance'

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-6">
      {/* Top Suite Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-brand-cyan/15 text-brand-cyan">
            <Maximize2 size={20} />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Field of View, Framing & Sensors Suite
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Combined optical framing tools: Angle of View, multi-camera focal matching & subject distance
            </p>
          </div>
        </div>

        <div className="flex flex-wrap bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-mono self-start sm:self-auto gap-1">
          <button
            onClick={() => setActiveTab('fov')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'fov'
                ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Maximize2 size={13} />
            <span>Field of View</span>
          </button>
          <button
            onClick={() => setActiveTab('focal-match')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'focal-match'
                ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw size={13} />
            <span>Focal Match (2 Cameras)</span>
          </button>
          <button
            onClick={() => setActiveTab('subject-distance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'subject-distance'
                ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ruler size={13} />
            <span>Subject Distance</span>
          </button>
        </div>
      </div>

      {/* Render selected tool */}
      {activeTab === 'fov' && <FovView isEmbedded />}
      {activeTab === 'focal-match' && <FocalLengthMatchView isEmbedded />}
      {activeTab === 'subject-distance' && <SubjectDistanceView onSelectView={() => setActiveTab('fov')} isEmbedded />}
    </div>
  );
}
