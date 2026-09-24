import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { GameRenderer } from '../game/renderer';
import { ARENA_HEIGHT, ARENA_WIDTH, CAMPAIGN_LEVELS } from '../game/constants';
import { HUD } from './HUD';
import { CountdownOverlay } from './CountdownOverlay';
import { RoundEndOverlay } from './RoundEndOverlay';
import { PauseModal } from './PauseModal';
import { VictoryModal } from './VictoryModal';
import { DefeatModal } from './DefeatModal';
import { soundManager } from '../audio/soundManager';
import { Keyboard } from 'lucide-react';

interface GameCanvasProps {
  engine: GameEngine;
  onMainMenu: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, onMainMenu }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const reqIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Reactive state synced with engine
  const [gameState, setGameState] = useState(engine.gameState);
  const [countdownStep, setCountdownStep] = useState(engine.countdownStep);
  const [roundWinner, setRoundWinner] = useState(engine.roundWinner);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch/mobile
  useEffect(() => {
    const isTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth < 640;
    setIsTouchDevice(isTouch);
  }, []);

  // Hook engine callbacks
  useEffect(() => {
    engine.onStateChange = (newState) => {
      setGameState(newState);
      setCountdownStep(engine.countdownStep);
      setRoundWinner(engine.roundWinner);
    };

    return () => {
      engine.onStateChange = undefined;
    };
  }, [engine]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default page scroll for game keys
      if (
        ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyP', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(
          e.code
        )
      ) {
        e.preventDefault();
      }

      engine.keys[e.code] = true;

      // Pause toggle
      if (e.code === 'KeyP') {
        if (engine.gameState === 'BATTLE') {
          engine.pause();
        } else if (engine.gameState === 'PAUSED') {
          engine.resume();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.keys[e.code] = false;
    };

    const handleBlur = () => {
      // Clear stuck keys if user tabs out
      engine.keys = {};
      if (engine.gameState === 'BATTLE') {
        engine.pause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [engine]);

  // Main Animation / Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    rendererRef.current = new GameRenderer(ctx);
    lastTimeRef.current = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.05, (currentTime - lastTimeRef.current) / 1000);
      lastTimeRef.current = currentTime;

      // Update engine physics & logic
      engine.update(dt);

      // Render frame
      if (rendererRef.current) {
        let theme: 'CYAN_MATRIX' | 'CRIMSON_FORGE' | 'NEON_PURPLE' | 'GOLD_CORE' = 'CYAN_MATRIX';
        if (engine.gameMode === 'CAMPAIGN') {
          const camp = CAMPAIGN_LEVELS[engine.currentLevel - 1];
          if (camp) theme = camp.arenaColorTheme;
        } else if (engine.difficulty === 'HARD' || engine.difficulty === 'EXTREME_HARD') {
          theme = 'CRIMSON_FORGE';
        } else if (engine.difficulty === 'HARDCORE') {
          theme = 'GOLD_CORE';
        }

        rendererRef.current.render(
          dt,
          engine.vex,
          engine.nova,
          engine.powerUps,
          engine.obstacles,
          engine.hazards,
          engine.collapsingPlatforms,
          engine.barriers,
          engine.particles,
          engine.floatingTexts,
          engine.screenShake,
          theme
        );
      }

      // Sync state for countdown or round status changes
      if (engine.gameState === 'COUNTDOWN' && countdownStep !== engine.countdownStep) {
        setCountdownStep(engine.countdownStep);
      }

      reqIdRef.current = requestAnimationFrame(loop);
    };

    reqIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (reqIdRef.current) {
        cancelAnimationFrame(reqIdRef.current);
      }
    };
  }, [engine, countdownStep]);

  // Action handlers
  const handlePause = useCallback(() => {
    engine.pause();
  }, [engine]);

  const handleResume = useCallback(() => {
    engine.resume();
  }, [engine]);

  const handleRestart = useCallback(() => {
    engine.startMatch(engine.gameMode, engine.difficulty, engine.currentLevel);
  }, [engine]);

  const handleNextLevel = useCallback(() => {
    if (engine.gameMode === 'CAMPAIGN') {
      const nextLvl = engine.currentLevel + 1;
      engine.startMatch('CAMPAIGN', engine.difficulty, nextLvl);
    } else if (engine.gameMode === 'ENDLESS') {
      const nextLvl = engine.currentLevel + 1;
      engine.startMatch('ENDLESS', engine.difficulty, nextLvl);
    }
  }, [engine]);

  const handleToggleMute = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden select-none"
    >
      {/* Aspect Ratio Box to keep 960x600 arena proportion */}
      <div className="relative w-full max-w-[1200px] aspect-[960/600] flex items-center justify-center shadow-2xl">
        <canvas
          ref={canvasRef}
          width={ARENA_WIDTH}
          height={ARENA_HEIGHT}
          className="w-full h-full block bg-slate-950 rounded-xl border border-slate-800 shadow-2xl object-contain"
        />

        {/* HUD Overlay */}
        <HUD
          engine={engine}
          onPause={handlePause}
          onToggleMute={handleToggleMute}
          isMuted={isMuted}
        />

        {/* Countdown Overlay */}
        {gameState === 'COUNTDOWN' && (
          <CountdownOverlay round={engine.currentRound} count={countdownStep} />
        )}

        {/* Round End Overlay */}
        {gameState === 'ROUND_END' && (
          <RoundEndOverlay winner={roundWinner} round={engine.currentRound} />
        )}

        {/* Pause Modal */}
        {gameState === 'PAUSED' && (
          <PauseModal
            onResume={handleResume}
            onRestart={handleRestart}
            onMainMenu={onMainMenu}
          />
        )}

        {/* Victory Modal */}
        {gameState === 'VICTORY' && (
          <VictoryModal
            engine={engine}
            onNextLevel={handleNextLevel}
            onPlayAgain={handleRestart}
            onMainMenu={onMainMenu}
          />
        )}

        {/* Defeat Modal */}
        {gameState === 'DEFEAT' && (
          <DefeatModal
            engine={engine}
            onRetry={handleRestart}
            onMainMenu={onMainMenu}
          />
        )}

        {/* Mobile keyboard notification banner */}
        {isTouchDevice && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-amber-950/90 border border-amber-500/40 text-amber-300 text-[11px] font-mono-data flex items-center gap-2 pointer-events-auto z-20">
            <Keyboard className="w-3.5 h-3.5 shrink-0" />
            <span>MECHA CLASH is designed for keyboard gameplay (WASD + F + G).</span>
          </div>
        )}
      </div>
    </div>
  );
};
