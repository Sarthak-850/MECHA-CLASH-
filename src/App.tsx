/**
 * Mecha Clash - Main Application Controller
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { DifficultyLevel, GameMode } from './types/game';
import { soundManager } from './audio/soundManager';
import { MainMenu } from './components/MainMenu';
import { DifficultySelect } from './components/DifficultySelect';
import { CampaignSelect } from './components/CampaignSelect';
import { HowToPlay } from './components/HowToPlay';
import { GameCanvas } from './components/GameCanvas';

type AppScreen =
  | 'MENU'
  | 'DIFFICULTY_SELECT'
  | 'CAMPAIGN_SELECT'
  | 'HOW_TO_PLAY'
  | 'PLAYING';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('MENU');
  const [bestScore, setBestScore] = useState<number>(0);
  const [bestEndlessLevel, setBestEndlessLevel] = useState<number>(1);
  const [unlockedCampaignLevel, setUnlockedCampaignLevel] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());

  const engineRef = useRef<GameEngine | null>(null);

  // Initialize engine once
  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }
  const engine = engineRef.current;

  // Load saved progression from localStorage
  const refreshStorageData = useCallback(() => {
    try {
      const savedScore = parseInt(
        localStorage.getItem('mecha_clash_best_score') || '0',
        10
      );
      const savedEndless = parseInt(
        localStorage.getItem('mecha_clash_best_endless_level') || '1',
        10
      );
      const savedCampaign = parseInt(
        localStorage.getItem('mecha_clash_campaign_unlocked') || '1',
        10
      );
      setBestScore(savedScore);
      setBestEndlessLevel(savedEndless);
      setUnlockedCampaignLevel(savedCampaign);
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  useEffect(() => {
    refreshStorageData();
  }, [refreshStorageData]);

  // Screen Transitions & Game Starters
  const handleStartQuickDuel = useCallback(() => {
    setCurrentScreen('DIFFICULTY_SELECT');
  }, []);

  const handleSelectDifficulty = useCallback(
    (diff: DifficultyLevel) => {
      engine.startMatch('QUICK_DUEL', diff, 1);
      setCurrentScreen('PLAYING');
    },
    [engine]
  );

  const handleStartCampaign = useCallback(() => {
    refreshStorageData();
    setCurrentScreen('CAMPAIGN_SELECT');
  }, [refreshStorageData]);

  const handleSelectCampaignLevel = useCallback(
    (level: number) => {
      engine.startMatch('CAMPAIGN', 'NORMAL', level);
      setCurrentScreen('PLAYING');
    },
    [engine]
  );

  const handleStartEndless = useCallback(() => {
    engine.startMatch('ENDLESS', 'NORMAL', 1);
    setCurrentScreen('PLAYING');
  }, [engine]);

  const handleHowToPlay = useCallback(() => {
    setCurrentScreen('HOW_TO_PLAY');
  }, []);

  const handleBackToMenu = useCallback(() => {
    engine.gameState = 'MENU';
    refreshStorageData();
    setCurrentScreen('MENU');
  }, [engine, refreshStorageData]);

  const handleToggleMute = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  return (
    <main className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {currentScreen === 'MENU' && (
        <MainMenu
          onQuickDuel={handleStartQuickDuel}
          onCampaign={handleStartCampaign}
          onEndless={handleStartEndless}
          onHowToPlay={handleHowToPlay}
          onToggleMute={handleToggleMute}
          isMuted={isMuted}
          bestScore={bestScore}
          bestEndlessLevel={bestEndlessLevel}
        />
      )}

      {currentScreen === 'DIFFICULTY_SELECT' && (
        <DifficultySelect
          onSelect={handleSelectDifficulty}
          onBack={handleBackToMenu}
        />
      )}

      {currentScreen === 'CAMPAIGN_SELECT' && (
        <CampaignSelect
          unlockedLevel={unlockedCampaignLevel}
          onSelectLevel={handleSelectCampaignLevel}
          onBack={handleBackToMenu}
        />
      )}

      {currentScreen === 'HOW_TO_PLAY' && (
        <HowToPlay onBack={handleBackToMenu} />
      )}

      {currentScreen === 'PLAYING' && (
        <GameCanvas engine={engine} onMainMenu={handleBackToMenu} />
      )}
    </main>
  );
}
