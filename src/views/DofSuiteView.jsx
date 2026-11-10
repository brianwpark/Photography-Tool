import React, { useState, useEffect } from 'react';
import DofView from './DofView.jsx';
import DofTableView from './DofTableView.jsx';
import { Focus, Table } from 'lucide-react';

export default function DofSuiteView({ initialTab = 'calc' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'calc' or 'matrix'

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-6">
      {/* Top Suite Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-brand-cyan/15 text-brand-cyan">
            <Focus size={20} />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Depth of Field & Focus Suite
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Combined optical calculators: interactive DoF, 1/3-stop rotary dial & hyperfocal matrix
            </p>
          </div>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-mono self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'calc'
                ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Focus size={14} />
            <span>DoF Calculator</span>
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'matrix'
                ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table size={14} />
            <span>Reference Matrix</span>
          </button>
        </div>
      </div>

      {/* Render selected tool */}
      {activeTab === 'calc' ? (
        <DofView onSelectView={() => setActiveTab('matrix')} isEmbedded />
      ) : (
        <DofTableView onSelectView={() => setActiveTab('calc')} isEmbedded />
      )}
    </div>
  );
}
