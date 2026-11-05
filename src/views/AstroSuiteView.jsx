import React, { useState, useEffect } from 'react';
import SpotStarsView from './SpotStarsView.jsx';
import StarTrailsView from './StarTrailsView.jsx';
import TimelapseView from './TimelapseView.jsx';
import MeteorShowersView from './MeteorShowersView.jsx';
import { Sparkles, Orbit, Video, Flame } from 'lucide-react';

export default function AstroSuiteView({ initialTab = 'spot-stars' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'spot-stars', 'star-trails', 'timelapse', 'meteor-showers'

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-6">
      {/* Top Suite Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-purple-500/15 text-purple-400">
            <Sparkles size={20} />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Astrophotography & Night Motion Suite
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Combined night sky tools: Spot Stars (NPF), Star Trails arcs, Timelapse intervals & Meteor showers
            </p>
          </div>
        </div>

        <div className="flex flex-wrap bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-mono self-start sm:self-auto gap-1">
          <button
            onClick={() => setActiveTab('spot-stars')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'spot-stars'
                ? 'bg-purple-500 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={13} />
            <span>Spot Stars (500/NPF)</span>
          </button>
          <button
            onClick={() => setActiveTab('star-trails')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'star-trails'
                ? 'bg-purple-500 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Orbit size={13} />
            <span>Star Trails Arc</span>
          </button>
          <button
            onClick={() => setActiveTab('timelapse')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'timelapse'
                ? 'bg-purple-500 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video size={13} />
            <span>Hyperlapse & Timelapse</span>
          </button>
          <button
            onClick={() => setActiveTab('meteor-showers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'meteor-showers'
                ? 'bg-purple-500 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame size={13} />
            <span>Meteor Showers</span>
          </button>
        </div>
      </div>

      {/* Render selected tool */}
      {activeTab === 'spot-stars' && (
        <SpotStarsView
          onSelectView={view => {
            if (view === 'timelapse') setActiveTab('timelapse');
            else if (view === 'star-trails') setActiveTab('star-trails');
          }}
          isEmbedded
        />
      )}
      {activeTab === 'star-trails' && <StarTrailsView isEmbedded />}
      {activeTab === 'timelapse' && (
        <TimelapseView
          onSelectView={view => {
            if (view === 'star-trails') setActiveTab('star-trails');
          }}
          isEmbedded
        />
      )}
      {activeTab === 'meteor-showers' && <MeteorShowersView isEmbedded />}
    </div>
  );
}
