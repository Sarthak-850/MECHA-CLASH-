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
import { VirtualControls } from './VirtualControls';
import { soundManager } from '../audio/soundManager';
import { RotateCw, X } from 'lucide-react';

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

  // Touch and orientation detection
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showTouchControls, setShowTouchControls] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [dismissPortraitNotice, setDismissPortraitNotice] = useState(false);

  // Initialize and track touch detection + orientation
  useEffect(() => {
    const checkTouchAndOrientation = () => {
      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;

      setIsTouchDevice(hasTouch);
      if (hasTouch) {
        setShowTouchControls(true);
      }

      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 800;
      setIsPortrait(portrait);
    };

    checkTouchAndOrientation();

    // Any touch pointer anywhere turns on touch controls automatically
    const handleGlobalPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        setIsTouchDevice(true);
        setShowTouchControls(true);
      }
    };

    window.addEventListener('resize', checkTouchAndOrientation);
    window.addEventListener('orientationchange', checkTouchAndOrientation);
    window.addEventListener('pointerdown', handleGlobalPointerDown);

    return () => {
      window.removeEventListener('resize', checkTouchAndOrientation);
      window.removeEventListener('orientationchange', checkTouchAndOrientation);
      window.removeEventListener('pointerdown', handleGlobalPointerDown);
    };
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

  // Keyboard Event Handlers (Preserved 100% for desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default page scroll for game keys
      if (
        [
          'KeyW',
          'KeyA',
          'KeyS',
          'KeyD',
          'KeyF',
          'KeyG',
          'KeyP',
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'Space',
        ].includes(e.code)
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
      // Clear stuck keys if user tabs out or switches apps
      engine.keys = {};
      engine.setJoystickVector(0, 0);
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
      className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 overflow-hidden select-none touch-none"
      style={{ touchAction: 'none' }}
    >
      {/* Portrait Suggestion Notice (Non-blocking, dismissible) */}
      {isPortrait && isTouchDevice && !dismissPortraitNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-cyan-500/40 text-cyan-300 text-[11px] sm:text-xs font-mono-data py-1.5 px-3 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-md animate-pulse">
          <RotateCw className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Rotate your phone for the best experience.</span>
          <button
            onClick={() => setDismissPortraitNotice(true)}
            className="p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer ml-1"
            aria-label="Dismiss notice"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Responsive Aspect-Ratio Preserving Game Arena */}
      <div className="relative w-full h-full flex items-center justify-center p-0.5 sm:p-2">
        <div className="relative w-full h-full max-w-[1280px] max-h-[100vh] aspect-[960/600] flex items-center justify-center shadow-2xl">
          <canvas
            ref={canvasRef}
            width={ARENA_WIDTH}
            height={ARENA_HEIGHT}
            className="w-full h-full block bg-slate-950 rounded-xl border border-slate-800/80 shadow-2xl object-contain"
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

          {/* Mobile Virtual Controls (Joystick & Action Buttons) */}
          {showTouchControls && (gameState === 'BATTLE' || gameState === 'COUNTDOWN') && (
            <VirtualControls engine={engine} />
          )}
        </div>
      </div>
    </div>
  );
};
