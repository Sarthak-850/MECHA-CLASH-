import React from 'react';
import { GameEngine } from '../game/engine';
import { Trophy, ArrowRight, RotateCcw, Home, Clock, Swords, ShieldAlert, Award, Heart } from 'lucide-react';
import { CAMPAIGN_LEVELS } from '../game/constants';

interface VictoryModalProps {
  engine: GameEngine;
  onNextLevel: () => void;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  engine,
  onNextLevel,
  onPlayAgain,
  onMainMenu,
}) => {
  const stats = engine.matchStats;
  const isCampaign = engine.gameMode === 'CAMPAIGN';
  const isEndless = engine.gameMode === 'ENDLESS';
  const hasNextCampaignLevel = isCampaign && engine.currentLevel < CAMPAIGN_LEVELS.length;
  const showNextButton = hasNextCampaignLevel || isEndless;

  const minutes = Math.floor(stats.durationSeconds / 60);
  const seconds = Math.floor(stats.durationSeconds % 60);
  const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-950/60 flex flex-col items-center">
        {/* Victory Trophy Icon */}
        <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-md shadow-cyan-500/20">
          <Trophy className="w-7 h-7" />
        </div>

        <h2 className="font-display font-black text-4xl sm:text-5xl text-cyan-400 tracking-wider uppercase mb-1 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] glow-cyan">
          VICTORY
        </h2>
        <span className="text-xs text-slate-400 font-mono-data tracking-wide uppercase mb-5">
          {isCampaign
            ? `LEVEL ${engine.currentLevel} COMPLETE`
            : isEndless
            ? `ENDLESS WAVE ${engine.currentLevel} CLEARED`
            : `${engine.difficulty} DUEL WON`}
        </span>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-6 text-xs font-mono-data">
          {/* Total Score */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase">MATCH SCORE</span>
            <span className="text-cyan-400 font-bold text-base mt-0.5">
              {engine.score.toLocaleString()} PTS
            </span>
          </div>

          {/* Match Duration */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
              <Clock className="w-3 h-3" /> DURATION
            </span>
            <span className="text-white font-semibold text-base mt-0.5">
              {durationStr}
            </span>
          </div>

          {/* Damage Dealt */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
              <Swords className="w-3 h-3 text-cyan-400" /> DAMAGE DEALT
            </span>
            <span className="text-cyan-300 font-semibold text-sm mt-0.5">
              {Math.round(stats.damageDealt)} HP
            </span>
          </div>

          {/* Damage Received */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-red-400" /> DAMAGE TAKEN
            </span>
            <span className="text-slate-300 font-semibold text-sm mt-0.5">
              {Math.round(stats.damageReceived)} HP
            </span>
          </div>

          {/* Win Streak */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400" /> WIN STREAK
            </span>
            <span className="text-amber-400 font-semibold text-sm mt-0.5">
              {engine.winStreak} STREAK
            </span>
          </div>

          {/* Remaining Lives */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-400" /> LIVES REMAINING
            </span>
            <span className="text-rose-400 font-semibold text-sm mt-0.5">
              {engine.vex.lives} / 3 LIVES
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {showNextButton && (
            <button
              onClick={onNextLevel}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-sm tracking-wider uppercase rounded-lg transition-all shadow-lg shadow-cyan-500/30 cursor-pointer"
            >
              NEXT LEVEL <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onPlayAgain}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 ${
              showNextButton
                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
            } font-display text-sm tracking-wider uppercase rounded-lg transition-all cursor-pointer`}
          >
            <RotateCcw className="w-4 h-4" /> PLAY AGAIN
          </button>

          <button
            onClick={onMainMenu}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-transparent hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-display text-xs tracking-wider uppercase rounded-lg transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" /> MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
