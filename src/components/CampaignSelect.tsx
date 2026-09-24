import React from 'react';
import { CAMPAIGN_LEVELS } from '../game/constants';
import { ArrowLeft, Lock, Play, ShieldCheck, AlertTriangle } from 'lucide-react';

interface CampaignSelectProps {
  unlockedLevel: number;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

export const CampaignSelect: React.FC<CampaignSelectProps> = ({
  unlockedLevel,
  onSelectLevel,
  onBack,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-8 bg-slate-950 overflow-y-auto select-none">
      <div className="absolute inset-0 scanlines opacity-40 pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-600 text-xs font-mono-data text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> BACK
        </button>
        <span className="font-display font-semibold text-xs text-slate-400 tracking-widest uppercase">
          OPERATIONAL CAMPAIGN MAP
        </span>
      </div>

      {/* Title */}
      <div className="text-center z-10 mb-6">
        <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-wider uppercase mb-1">
          CAMPAIGN PROGRESSION
        </h2>
        <p className="text-xs text-slate-400 font-mono-data">
          Progressively battle through 8 escalating combat sectors to confront Apex NOVA.
        </p>
      </div>

      {/* 8 Campaign Levels Grid */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-3.5 z-10 my-auto">
        {CAMPAIGN_LEVELS.map((stage) => {
          const isUnlocked = stage.level <= unlockedLevel;
          const isCompleted = stage.level < unlockedLevel;

          return (
            <div
              key={stage.level}
              className={`p-4 rounded-xl border transition-all ${
                isUnlocked
                  ? 'bg-slate-900/90 border-slate-700/80 hover:border-cyan-500/60 shadow-lg'
                  : 'bg-slate-950/60 border-slate-900 opacity-60'
              } flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm sm:text-base text-white">
                      {stage.title}
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[10px] font-mono-data text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" /> CLEARED
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono-data uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {stage.difficulty}
                  </span>
                </div>

                <div className="text-xs text-cyan-400 font-display mb-1.5">
                  {stage.subtitle}
                </div>

                <p className="text-[11px] text-slate-400 font-mono-data leading-relaxed line-clamp-2 mb-3">
                  {stage.briefing}
                </p>

                {/* Hazards Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {stage.hazardsEnabled ? (
                    stage.hazardTypes.map((hz) => (
                      <span
                        key={hz}
                        className="flex items-center gap-1 text-[9px] font-mono-data uppercase px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300"
                      >
                        <AlertTriangle className="w-2.5 h-2.5" /> {hz}
                      </span>
                    ))
                  ) : (
                    <span className="text-[9px] font-mono-data uppercase px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400">
                      NO HAZARDS
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              {isUnlocked ? (
                <button
                  onClick={() => onSelectLevel(stage.level)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-cyan-950 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> DEPLOY TO SECTOR
                </button>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 font-mono-data text-xs uppercase">
                  <Lock className="w-3.5 h-3.5" /> COMPLETE LEVEL {stage.level - 1} TO UNLOCK
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="w-full max-w-4xl text-center text-[11px] font-mono-data text-slate-400 z-10 mt-4">
        CAMPAIGN PROGRESS IS SAVED AUTOMATICALLY IN LOCAL STORAGE
      </div>
    </div>
  );
};
