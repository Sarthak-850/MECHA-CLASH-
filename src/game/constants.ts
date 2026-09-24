import {
  AIDifficultyConfig,
  CampaignLevelConfig,
  DifficultyLevel,
} from '../types/game';

export const ARENA_WIDTH = 960;
export const ARENA_HEIGHT = 600;

export const MECH_RADIUS = 26;
export const BASE_HP = 100;
export const MAX_LIVES = 3;

export const BASE_SPEED = 210; // px per second
export const SPEED_BOOST_SPEED = 300;
export const SPEED_BOOST_DURATION = 6.0; // seconds

export const ATTACK_COOLDOWN = 0.42; // seconds
export const ATTACK_DURATION = 0.16; // visual slash window
export const ATTACK_REACH = 74; // range from center
export const ATTACK_ARC = Math.PI * 0.72; // arc sweep
export const BASE_ATTACK_DAMAGE = 18;
export const POWER_ATTACK_DAMAGE = 36;

export const DASH_SPEED = 620;
export const DASH_DURATION = 0.22;
export const DASH_COOLDOWN = 1.35;
export const DASH_INVULNERABLE_TIME = 0.18;

export const HIT_STUN_DURATION = 0.16;
export const INVULNERABLE_AFTER_HIT = 0.35;

export const POWER_UP_DURATION = 14; // despawn timer
export const POWER_UP_SPAWN_INTERVAL_MIN = 8;
export const POWER_UP_SPAWN_INTERVAL_MAX = 13;

export const AI_DIFFICULTIES: Record<DifficultyLevel, AIDifficultyConfig> = {
  NORMAL: {
    reactionDelay: 0.38,
    moveSpeedMultiplier: 0.88,
    attackRange: 68,
    attackProbability: 0.48,
    dodgeProbability: 0.18,
    dashProbability: 0.15,
    powerUpPriority: 0.3,
    predictionStrength: 0.05,
    hazardAwareness: 0.4,
    retreatThreshold: 18,
    strafeTendency: 0.2,
    description: 'Learn the basics.',
  },
  MEDIUM: {
    reactionDelay: 0.24,
    moveSpeedMultiplier: 0.96,
    attackRange: 72,
    attackProbability: 0.68,
    dodgeProbability: 0.42,
    dashProbability: 0.38,
    powerUpPriority: 0.65,
    predictionStrength: 0.28,
    hazardAwareness: 0.75,
    retreatThreshold: 26,
    strafeTendency: 0.45,
    description: 'Your opponent is getting smarter.',
  },
  HARD: {
    reactionDelay: 0.14,
    moveSpeedMultiplier: 1.02,
    attackRange: 74,
    attackProbability: 0.85,
    dodgeProbability: 0.68,
    dashProbability: 0.65,
    powerUpPriority: 0.88,
    predictionStrength: 0.55,
    hazardAwareness: 0.9,
    retreatThreshold: 32,
    strafeTendency: 0.65,
    description: 'Expect serious resistance.',
  },
  EXTREME_HARD: {
    reactionDelay: 0.08,
    moveSpeedMultiplier: 1.06,
    attackRange: 76,
    attackProbability: 0.92,
    dodgeProbability: 0.82,
    dashProbability: 0.8,
    powerUpPriority: 0.95,
    predictionStrength: 0.78,
    hazardAwareness: 0.96,
    retreatThreshold: 36,
    strafeTendency: 0.8,
    description: 'Only skilled players survive.',
  },
  HARDCORE: {
    reactionDelay: 0.04,
    moveSpeedMultiplier: 1.1,
    attackRange: 76,
    attackProbability: 0.98,
    dodgeProbability: 0.9,
    dashProbability: 0.88,
    powerUpPriority: 0.98,
    predictionStrength: 0.92,
    hazardAwareness: 0.99,
    retreatThreshold: 40,
    strafeTendency: 0.88,
    description: 'Your ultimate test.',
  },
};

export const CAMPAIGN_LEVELS: CampaignLevelConfig[] = [
  {
    level: 1,
    title: 'Level 1: Training',
    subtitle: 'Cadet Proving Grounds',
    difficulty: 'NORMAL',
    hazardsEnabled: false,
    hazardTypes: [],
    arenaColorTheme: 'CYAN_MATRIX',
    briefing: 'Basic combat simulation. NOVA AI running in calibration mode with sluggish servo response. Get comfortable with movement and dashing.',
  },
  {
    level: 2,
    title: 'Level 2: Rookie',
    subtitle: 'Sub-Grid Alpha',
    difficulty: 'NORMAL',
    hazardsEnabled: true,
    hazardTypes: ['COLLAPSE'],
    arenaColorTheme: 'CYAN_MATRIX',
    briefing: 'NOVA engages with improved pathing. Arena telemetry reports unstable flooring tiles. Watch your step!',
  },
  {
    level: 3,
    title: 'Level 3: Rival',
    subtitle: 'Neon Foundry',
    difficulty: 'NORMAL',
    hazardsEnabled: true,
    hazardTypes: ['COLLAPSE', 'ELECTRIC'],
    arenaColorTheme: 'NEON_PURPLE',
    briefing: 'High-voltage relay stations activated. Electric discharge nodes periodically pulse lethal current.',
  },
  {
    level: 4,
    title: 'Level 4: Challenger',
    subtitle: 'Cyber Nexus',
    difficulty: 'MEDIUM',
    hazardsEnabled: true,
    hazardTypes: ['ELECTRIC', 'BARRIER'],
    arenaColorTheme: 'NEON_PURPLE',
    briefing: 'NOVA combat protocols upgraded to Medium. Moving plasma barriers sweep through center corridors.',
  },
  {
    level: 5,
    title: 'Level 5: Hunter',
    subtitle: 'Iron Crucible',
    difficulty: 'MEDIUM',
    hazardsEnabled: true,
    hazardTypes: ['COLLAPSE', 'ELECTRIC', 'BARRIER'],
    arenaColorTheme: 'CRIMSON_FORGE',
    briefing: 'NOVA will aggressively contest power-up drops and punish reckless dashes. Multi-hazard arena active.',
  },
  {
    level: 6,
    title: 'Level 6: Elite',
    subtitle: 'Singularity Ring',
    difficulty: 'HARD',
    hazardsEnabled: true,
    hazardTypes: ['COLLAPSE', 'ELECTRIC', 'BARRIER'],
    arenaColorTheme: 'CRIMSON_FORGE',
    briefing: 'Elite military tier. NOVA predicts your strafing vectors and executes precision counter-slashes.',
  },
  {
    level: 7,
    title: 'Level 7: Destroyer',
    subtitle: 'Oblivion Spire',
    difficulty: 'EXTREME_HARD',
    hazardsEnabled: true,
    hazardTypes: ['COLLAPSE', 'ELECTRIC', 'BARRIER'],
    arenaColorTheme: 'GOLD_CORE',
    briefing: 'Extreme threat level. Minimal reaction lag, ruthless positioning, and high-frequency dash evasion.',
  },
  {
    level: 8,
    title: 'Level 8: Nightmare',
    subtitle: 'Apex Core Chamber',
    difficulty: 'HARDCORE',
    hazardsEnabled: true,
    hazardTypes: ['COLLAPSE', 'ELECTRIC', 'BARRIER'],
    arenaColorTheme: 'GOLD_CORE',
    briefing: 'The Ultimate Mecha Clash. NOVA operates at peak synaptic velocity. Only the most disciplined pilot can prevail.',
  },
];
