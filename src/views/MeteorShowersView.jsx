import React, { useState } from 'react';
import { Flame, Star, Moon, Calendar, Sparkles } from 'lucide-react';

export const METEOR_SHOWERS = [
  {
    id: 'perseids',
    name: 'Perseids',
    activePeriod: 'Jul 17 – Aug 24',
    peakDate: 'August 12–13',
    zhr: 100,
    radiantConstellation: 'Perseus (NE Sky)',
    speedKmS: 59,
    parentBody: 'Comet 109P/Swift-Tuttle',
    moonInterference: 'Low (Waxing Crescent)',
    description: 'Fast, bright meteors frequently producing prominent luminous smoke trains.'
  },
  {
    id: 'geminids',
    name: 'Geminids',
    activePeriod: 'Dec 4 – Dec 17',
    peakDate: 'December 13–14',
    zhr: 150,
    radiantConstellation: 'Gemini (High Overhead)',
    speedKmS: 35,
    parentBody: 'Asteroid 3200 Phaethon',
    moonInterference: 'Minimal (New Moon Phase)',
    description: 'The king of annual meteor showers: intense, multi-colored slow fireballs.'
  },
  {
    id: 'quadrantids',
    name: 'Quadrantids',
    activePeriod: 'Dec 28 – Jan 12',
    peakDate: 'January 3–4',
    zhr: 120,
    radiantConstellation: 'Boötes (N Sky)',
    speedKmS: 41,
    parentBody: 'Asteroid 2003 EH1',
    moonInterference: 'Moderate',
    description: 'Very sharp, intense peak lasting only 6 hours with bright fireballs.'
  },
  {
    id: 'eta-aquariids',
    name: 'Eta Aquariids',
    activePeriod: 'Apr 19 – May 28',
    peakDate: 'May 5–6',
    zhr: 50,
    radiantConstellation: 'Aquarius (E Sky)',
    speedKmS: 66,
    parentBody: 'Comet 1P/Halley',
    moonInterference: 'Low',
    description: 'Fast meteors originating from Halley’s Comet with persistent glowing ion trains.'
  },
  {
    id: 'orionids',
    name: 'Orionids',
    activePeriod: 'Oct 2 – Nov 7',
    peakDate: 'October 21–22',
    zhr: 20,
    radiantConstellation: 'Orion (SE Sky)',
    speedKmS: 66,
    parentBody: 'Comet 1P/Halley',
    moonInterference: 'Low',
    description: 'Extra fast meteors often exploding into vivid fragmentation sparks.'
  },
  {
    id: 'lyrids',
    name: 'Lyrids',
    activePeriod: 'Apr 14 – Apr 30',
    peakDate: 'April 22–23',
    zhr: 18,
    radiantConstellation: 'Lyra (E Sky)',
    speedKmS: 49,
    parentBody: 'Comet C/1861 G1 Thatcher',
    moonInterference: 'Moderate',
    description: 'One of the oldest recorded meteor showers, observed for over 2,700 years.'
  }
];

export default function MeteorShowersView() {
  const [selectedShower, setSelectedShower] = useState(METEOR_SHOWERS[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-orange-500/15 text-orange-400">
            <Flame size={20} />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Meteor Showers Calendar & Radiant Guide
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Annual peaks, Zenithal Hourly Rates (ZHR), radiant positions & lunar interference
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Selected Shower Detailed Card */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-semibold">
                FEATURED SHOWER PROFILE
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold border border-orange-500/40">
                Peak: {selectedShower.peakDate}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              {selectedShower.name}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Active: {selectedShower.activePeriod} • Source: {selectedShower.parentBody}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono text-center">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase block">Max ZHR</span>
              <span className="text-2xl font-bold text-orange-400">{selectedShower.zhr}</span>
              <span className="text-[10px] text-slate-500 block">meteors / hr</span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase block">Entry Velocity</span>
              <span className="text-2xl font-bold text-brand-cyan">{selectedShower.speedKmS}</span>
              <span className="text-[10px] text-slate-500 block">km / sec</span>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase block">Moon Impact</span>
              <span className="text-xs font-bold text-slate-200 mt-2 block">{selectedShower.moonInterference.split(' ')[0]}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-white">Shooting Direction & Composition:</div>
            <p className="leading-relaxed">
              Do not point directly at the radiant in <strong className="text-orange-400">{selectedShower.radiantConstellation}</strong>.
              Point your camera 30° to 45° away from the radiant to capture the longest, most dramatic meteor streak tails across your lens framing.
            </p>
          </div>
        </div>

        {/* Annual Calendar List Column */}
        <div className="lg:col-span-6 space-y-2.5">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block px-1">
            Major Annual Showers
          </span>
          {METEOR_SHOWERS.map(shower => {
            const isSelected = selectedShower.id === shower.id;
            return (
              <div
                key={shower.id}
                onClick={() => setSelectedShower(shower)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between font-mono text-xs ${
                  isSelected
                    ? 'bg-orange-500/15 border-orange-400/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                    : 'bg-slate-900/60 border-white/5 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{shower.name}</span>
                    <span className="text-[10px] text-orange-400 font-semibold">
                      ZHR ~{shower.zhr}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Peak: {shower.peakDate} • Radiant: {shower.radiantConstellation}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Velocity</span>
                  <span className="font-bold text-brand-cyan">{shower.speedKmS} km/s</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
