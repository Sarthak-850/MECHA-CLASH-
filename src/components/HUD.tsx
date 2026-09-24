import React from 'react';
import { soundManager } from '../audio/soundManager';
import { GameEngine } from '../game/engine';
import { BASE_HP, MAX_LIVES } from '../game/constants';
import { Volume2, VolumeX, Pause, Shield, Zap, Flame, Award } from 'lucide-react';

interface HUDProps {
  engine: GameEngine;
  onPause: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  engine,
  onPause,
  onToggleMute,
  isMuted,
}) => {
  const vex = engine.vex;
  const nova = engine.nova;

  const vexHpPct = Math.max(0, Math.min(100, (vex.hp / BASE_HP) * 100));
  const novaHpPct = Math.max(0, Math.min(100, (nova.hp / BASE_HP) * 100));

  const dashReady = vex.dashCooldown <= 0;
  const dashPct = dashReady
    ? 100
    : Math.max(0, 100 - (vex.dashCooldown / vex.maxDashCooldown) * 100);

  return (
    <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 pointer-events-none flex flex-col justify-between select-none">
      {/* Top Bar: Mecha Health, Round, and Controls */}
      <div className="flex items-start justify-between gap-4">
        {/* VEX (Player) Panel */}
        <div className="flex-1 max-w-xs sm:max-w-sm pointer-events-auto bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 rounded-lg p-2.5 shadow-lg shadow-cyan-950/40">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-cyan-400 text-sm tracking-wider">
                VEX
              </span>
              <span className="text-[10px] text-slate-400 font-mono-data uppercase">
                [PLAYER]
              </span>
            </div>
            {/* Lives */}
            <div className="flex items-center gap-1.5" title={`${vex.lives} Lives Remaining`}>
              {Array.from({ length: MAX_LIVES }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rotate-45 border transition-all ${
                    idx < vex.lives
                      ? 'bg-cyan-400 border-cyan-200 shadow-sm shadow-cyan-400'
                      : 'bg-slate-900 border-slate-700 opacity-40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Health Bar */}
          <div className="h-3 bg-slate-900 rounded-xs overflow-hidden border border-slate-800 relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-100 ease-out"
              style={{ width: `${vexHpPct}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1 text-[11px] font-mono-data text-slate-300">
            <span>HP: {Math.ceil(vex.hp)} / 100</span>
            {/* Dash Status Indicator */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">DASH [G]</span>
              <div className="w-12 h-1.5 bg-slate-800 rounded-xs overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    dashReady ? 'bg-cyan-400' : 'bg-slate-500'
                  }`}
                  style={{ width: `${dashPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Buffs */}
          <div className="flex items-center gap-2 mt-1.5 min-h-[18px]">
            {vex.hasShield && (
              <span className="flex items-center gap-1 text-[10px] font-mono-data text-blue-300 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-500/40">
                <Shield className="w-2.5 h-2.5" /> SHIELD
              </span>
            )}
            {vex.hasPowerAttack && (
              <span className="flex items-center gap-1 text-[10px] font-mono-data text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">
                <Flame className="w-2.5 h-2.5" /> POWER ATK
              </span>
            )}
            {vex.speedBoostTimer > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-mono-data text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                <Zap className="w-2.5 h-2.5" /> SPEED +
              </span>
            )}
          </div>
        </div>

        {/* Center Arena Status */}
        <div className="flex flex-col items-center pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg px-4 py-2 shadow-lg">
          <div className="font-display text-xs text-slate-400 uppercase tracking-widest">
            {engine.gameMode === 'CAMPAIGN'
              ? `LEVEL ${engine.currentLevel}`
              : engine.gameMode === 'ENDLESS'
              ? `ENDLESS LVL ${engine.currentLevel}`
              : `${engine.difficulty}`}
          </div>
          <div className="font-display font-black text-lg text-white tracking-wider glow-cyan">
            ROUND {engine.currentRound}
          </div>
          <div className="flex items-center gap-3 text-xs font-mono-data text-slate-300 mt-0.5">
            <span className="text-cyan-400 font-semibold">{engine.score.toLocaleString()} PTS</span>
            {engine.winStreak > 0 && (
              <span className="flex items-center gap-1 text-amber-400">
                <Award className="w-3 h-3" /> {engine.winStreak} STREAK
              </span>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={onToggleMute}
              className="p-1 rounded bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onPause}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-[11px] font-mono-data text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
              title="Pause Game (P)"
            >
              <Pause className="w-3 h-3" /> PAUSE [P]
            </button>
          </div>
        </div>

        {/* NOVA (AI) Panel */}
        <div className="flex-1 max-w-xs sm:max-w-sm pointer-events-auto bg-slate-950/80 backdrop-blur-md border border-red-500/30 rounded-lg p-2.5 shadow-lg shadow-red-950/40">
          <div className="flex items-center justify-between mb-1.5">
            {/* Lives */}
            <div className="flex items-center gap-1.5" title={`${nova.lives} Lives Remaining`}>
              {Array.from({ length: MAX_LIVES }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rotate-45 border transition-all ${
                    idx < nova.lives
                      ? 'bg-red-500 border-red-200 shadow-sm shadow-red-500'
                      : 'bg-slate-900 border-slate-700 opacity-40'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono-data uppercase">
                [AI OPPONENT]
              </span>
              <span className="font-display font-extrabold text-red-500 text-sm tracking-wider">
                NOVA
              </span>
            </div>
          </div>

          {/* Health Bar */}
          <div className="h-3 bg-slate-900 rounded-xs overflow-hidden border border-slate-800 relative">
            <div
              className="h-full bg-gradient-to-l from-red-600 to-rose-400 transition-all duration-100 ease-out ml-auto"
              style={{ width: `${novaHpPct}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1 text-[11px] font-mono-data text-slate-300">
            <span className="text-slate-400 text-[10px]">
              AI: {engine.difficulty}
            </span>
            <span>HP: {Math.ceil(nova.hp)} / 100</span>
          </div>

          {/* AI Buffs */}
          <div className="flex items-center justify-end gap-2 mt-1.5 min-h-[18px]">
            {nova.hasShield && (
              <span className="flex items-center gap-1 text-[10px] font-mono-data text-blue-300 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-500/40">
                <Shield className="w-2.5 h-2.5" /> SHIELD
              </span>
            )}
            {nova.hasPowerAttack && (
              <span className="flex items-center gap-1 text-[10px] font-mono-data text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">
                <Flame className="w-2.5 h-2.5" /> POWER ATK
              </span>
            )}
            {nova.speedBoostTimer > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-mono-data text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                <Zap className="w-2.5 h-2.5" /> SPEED +
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
