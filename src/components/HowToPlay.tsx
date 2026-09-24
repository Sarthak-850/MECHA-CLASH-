import React from 'react';
import { ArrowLeft, Swords, Shield, Zap, Flame, BatteryCharging, AlertTriangle } from 'lucide-react';

interface HowToPlayProps {
  onBack: () => void;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-8 bg-slate-950 overflow-y-auto select-none">
      <div className="absolute inset-0 scanlines opacity-40 pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-600 text-xs font-mono-data text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> BACK
        </button>
        <span className="font-display font-semibold text-xs text-slate-400 tracking-widest uppercase">
          COMBAT FLIGHT MANUAL
        </span>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl flex flex-col gap-6 z-10 my-auto">
        <div className="text-center">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-wider uppercase mb-1">
            HOW TO PLAY
          </h2>
          <p className="text-xs text-slate-400 font-mono-data">
            Master the core loop: <span className="text-cyan-400">MOVE</span> →{' '}
            <span className="text-white">ATTACK</span> →{' '}
            <span className="text-cyan-400">DODGE</span> →{' '}
            <span className="text-amber-400">DASH</span> →{' '}
            <span className="text-emerald-400">POWER-UP</span>
          </p>
        </div>

        {/* Grid of Sections: Controls & Power-ups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Controls Section */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="font-display font-bold text-sm text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Swords className="w-4 h-4" /> PILOT KEYBOARD CONTROLS
            </h3>

            <div className="space-y-3 font-mono-data text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-slate-800 text-cyan-300 rounded border border-slate-700 font-bold">W</kbd>
                  <kbd className="px-2 py-1 bg-slate-800 text-cyan-300 rounded border border-slate-700 font-bold">A</kbd>
                  <kbd className="px-2 py-1 bg-slate-800 text-cyan-300 rounded border border-slate-700 font-bold">S</kbd>
                  <kbd className="px-2 py-1 bg-slate-800 text-cyan-300 rounded border border-slate-700 font-bold">D</kbd>
                </div>
                <span className="text-slate-300">Omni-Directional Movement (Supports Diagonals)</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <kbd className="px-3 py-1 bg-cyan-950 text-cyan-400 rounded border border-cyan-500/50 font-bold">F</kbd>
                <span className="text-slate-300">Plasma Blade Slash (Short-range arc attack)</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <kbd className="px-3 py-1 bg-amber-950 text-amber-400 rounded border border-amber-500/50 font-bold">G</kbd>
                <span className="text-slate-300">High-Velocity Dash (Invulnerable dodge frames)</span>
              </div>

              <div className="flex items-center justify-between">
                <kbd className="px-3 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700 font-bold">P</kbd>
                <span className="text-slate-300">Pause / Resume Combat Simulation</span>
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded bg-cyan-950/30 border border-cyan-500/20 text-[11px] font-mono-data text-cyan-300">
              💡 Pro Tip: Dash (G) grants brief invulnerability. Use it to dodge opponent swings or rapidly close distance!
            </div>
          </div>

          {/* Power-ups Section */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="font-display font-bold text-sm text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" /> BATTLEFIELD POWER-UPS
            </h3>

            <div className="space-y-2.5 font-mono-data text-xs">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-cyan-400">SPEED BOOST:</span>
                  <span className="text-slate-300 ml-1.5">Increases movement velocity by 45% for 6 seconds.</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-blue-950 border border-blue-500/40 text-blue-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-blue-400">ENERGY SHIELD:</span>
                  <span className="text-slate-300 ml-1.5">Completely blocks and absorbs the next incoming hit.</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-red-950 border border-red-500/40 text-red-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-red-400">POWER ATTACK:</span>
                  <span className="text-slate-300 ml-1.5">Next attack deals 2× critical damage (36 HP).</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400">
                  <span className="font-bold text-base px-1">✚</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-400">NANITE REPAIR (HEAL):</span>
                  <span className="text-slate-300 ml-1.5">Instantly recovers +30 HP armor integrity.</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-amber-950 border border-amber-500/40 text-amber-400">
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-amber-400">ENERGY REFILL:</span>
                  <span className="text-slate-300 ml-1.5">Instantly resets Dash cooldown to ready state.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Arena Hazards Guide */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-data text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white uppercase">DYNAMIC ARENA HAZARDS:</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Watch for flashing amber warnings before platforms collapse into void abyss. Avoid pulsing high-voltage electric nodes and moving plasma barriers.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right text-slate-400 text-[11px]">
            <span>100 HP · 3 LIVES PER MATCH</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-4xl text-center text-[11px] font-mono-data text-slate-400 z-10 mt-4">
        PRESS ANY BUTTON TO RETURN TO COCKPIT
      </div>
    </div>
  );
};
