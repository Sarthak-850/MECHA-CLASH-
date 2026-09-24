import {
  AIDifficultyConfig,
  CollapsingPlatform,
  HazardNode,
  MechState,
  MovingBarrier,
  Obstacle,
  PowerUp,
} from '../types/game';
import { ARENA_HEIGHT, ARENA_WIDTH } from './constants';

export interface AIAction {
  moveDir: { x: number; y: number };
  aimAngle: number;
  wantsAttack: boolean;
  wantsDash: boolean;
}

export class MechAI {
  private config: AIDifficultyConfig;
  private reactionTimer: number = 0;
  private currentMoveDir: { x: number; y: number } = { x: 0, y: 0 };
  private currentAimAngle: number = 0;
  private wantsAttack: boolean = false;
  private wantsDash: boolean = false;
  private strafeDir: number = 1; // 1 or -1
  private strafeSwitchTimer: number = 0;

  constructor(config: AIDifficultyConfig) {
    this.config = config;
  }

  public setConfig(config: AIDifficultyConfig) {
    this.config = config;
  }

  public update(
    dt: number,
    self: MechState,
    target: MechState,
    powerUps: PowerUp[],
    obstacles: Obstacle[],
    hazards: HazardNode[],
    collapsingPlatforms: CollapsingPlatform[],
    barriers: MovingBarrier[]
  ): AIAction {
    this.reactionTimer -= dt;
    this.strafeSwitchTimer -= dt;

    if (this.strafeSwitchTimer <= 0) {
      this.strafeDir = Math.random() > 0.5 ? 1 : -1;
      this.strafeSwitchTimer = 1.0 + Math.random() * 1.5;
    }

    // Only recalculate major tactical decisions on reaction tick
    if (this.reactionTimer <= 0) {
      this.reactionTimer = this.config.reactionDelay * (0.8 + Math.random() * 0.4);
      this.decideTactics(
        self,
        target,
        powerUps,
        obstacles,
        hazards,
        collapsingPlatforms,
        barriers
      );
    }

    return {
      moveDir: this.currentMoveDir,
      aimAngle: this.currentAimAngle,
      wantsAttack: this.wantsAttack,
      wantsDash: this.wantsDash,
    };
  }

  private decideTactics(
    self: MechState,
    target: MechState,
    powerUps: PowerUp[],
    obstacles: Obstacle[],
    hazards: HazardNode[],
    collapsingPlatforms: CollapsingPlatform[],
    barriers: MovingBarrier[]
  ) {
    // 1. Calculate distance and angles to player
    let targetX = target.x;
    let targetY = target.y;

    // Movement prediction based on player velocity and predictionStrength
    if (this.config.predictionStrength > 0) {
      const predTime = 0.25 * this.config.predictionStrength;
      targetX += target.vx * predTime;
      targetY += target.vy * predTime;
    }

    const dx = targetX - self.x;
    const dy = targetY - self.y;
    const distToTarget = Math.hypot(dx, dy);

    this.currentAimAngle = Math.atan2(target.y - self.y, target.x - self.x);
    this.wantsAttack = false;
    this.wantsDash = false;

    // 2. Hazard Avoidance Vectors
    let hazardRepelX = 0;
    let hazardRepelY = 0;

    if (this.config.hazardAwareness > 0.2) {
      // Avoid electric nodes
      for (const node of hazards) {
        if (node.state === 'WARNING' || node.state === 'ACTIVE') {
          const hdx = self.x - node.x;
          const hdy = self.y - node.y;
          const hdist = Math.hypot(hdx, hdy);
          const safeDist = node.radius + 35;
          if (hdist < safeDist && hdist > 0.001) {
            const urgency = (1 - hdist / safeDist) * 2.5 * this.config.hazardAwareness;
            hazardRepelX += (hdx / hdist) * urgency;
            hazardRepelY += (hdy / hdist) * urgency;
          }
        }
      }

      // Avoid collapsing platforms
      for (const plat of collapsingPlatforms) {
        if (plat.state === 'WARNING' || plat.state === 'COLLAPSED') {
          const platCenterX = plat.x + plat.width / 2;
          const platCenterY = plat.y + plat.height / 2;
          const pdx = self.x - platCenterX;
          const pdy = self.y - platCenterY;
          const pdist = Math.hypot(pdx, pdy);
          const halfDiag = Math.hypot(plat.width / 2, plat.height / 2) + 25;
          if (pdist < halfDiag && pdist > 0.001) {
            const urgency = (1 - pdist / halfDiag) * 2.8 * this.config.hazardAwareness;
            hazardRepelX += (pdx / pdist) * urgency;
            hazardRepelY += (pdy / pdist) * urgency;
          }
        }
      }

      // Avoid moving barriers
      for (const bar of barriers) {
        let bDist = 999;
        let bRepelX = 0;
        let bRepelY = 0;
        if (bar.axis === 'X') {
          bDist = Math.abs(self.x - bar.currentPos);
          if (bDist < 50 && self.y >= bar.y1 - 20 && self.y <= bar.y2 + 20) {
            bRepelX = (self.x > bar.currentPos ? 1 : -1) * (1 - bDist / 50) * 3;
          }
        } else {
          bDist = Math.abs(self.y - bar.currentPos);
          if (bDist < 50 && self.x >= bar.x1 - 20 && self.x <= bar.x2 + 20) {
            bRepelY = (self.y > bar.currentPos ? 1 : -1) * (1 - bDist / 50) * 3;
          }
        }
        hazardRepelX += bRepelX * this.config.hazardAwareness;
        hazardRepelY += bRepelY * this.config.hazardAwareness;
      }

      // Keep inside arena borders
      const margin = 50;
      if (self.x < margin) hazardRepelX += (margin - self.x) / margin;
      if (self.x > ARENA_WIDTH - margin) hazardRepelX -= (self.x - (ARENA_WIDTH - margin)) / margin;
      if (self.y < margin) hazardRepelY += (margin - self.y) / margin;
      if (self.y > ARENA_HEIGHT - margin) hazardRepelY -= (self.y - (ARENA_HEIGHT - margin)) / margin;
    }

    // 3. Obstacle collision avoidance vectors
    let obstacleRepelX = 0;
    let obstacleRepelY = 0;
    for (const obs of obstacles) {
      const obsCenterX = obs.x + obs.width / 2;
      const obsCenterY = obs.y + obs.height / 2;
      const odx = self.x - obsCenterX;
      const ody = self.y - obsCenterY;
      const odist = Math.hypot(odx, ody);
      const avoidDist = Math.max(obs.width, obs.height) + 30;
      if (odist < avoidDist && odist > 0.001) {
        obstacleRepelX += (odx / odist) * 1.5;
        obstacleRepelY += (ody / odist) * 1.5;
      }
    }

    // 4. Power-up seeking logic
    let powerUpTarget: PowerUp | null = null;
    if (powerUps.length > 0 && Math.random() < this.config.powerUpPriority) {
      // Find most desirable power-up
      let bestScore = -1;
      for (const p of powerUps) {
        const pDist = Math.hypot(p.x - self.x, p.y - self.y);
        let desire = 1000 - pDist;
        if (p.type === 'HEAL' && self.hp < 60) desire += 500;
        if (p.type === 'SHIELD' && !self.hasShield) desire += 350;
        if (p.type === 'POWER_ATTACK' && !self.hasPowerAttack) desire += 250;
        if (desire > bestScore) {
          bestScore = desire;
          powerUpTarget = p;
        }
      }
    }

    // 5. Tactical Mode Selection: RETREAT, ENGAGE, or SEEK_POWERUP
    const isLowHp = self.hp <= this.config.retreatThreshold && target.hp > self.hp;
    const shouldRetreat = isLowHp && Math.random() < 0.8;

    let desiredDirX = 0;
    let desiredDirY = 0;

    if (powerUpTarget && (!shouldRetreat || powerUpTarget.type === 'HEAL')) {
      // Head toward power-up
      const pdx = powerUpTarget.x - self.x;
      const pdy = powerUpTarget.y - self.y;
      const pdist = Math.hypot(pdx, pdy);
      if (pdist > 0.001) {
        desiredDirX = pdx / pdist;
        desiredDirY = pdy / pdist;
      }
    } else if (shouldRetreat) {
      // Retreat away from target
      if (distToTarget > 0.001) {
        desiredDirX = -dx / distToTarget;
        desiredDirY = -dy / distToTarget;
      }
      // Add strafe to make retreat harder to predict
      desiredDirX += (-dy / distToTarget) * 0.4 * this.strafeDir;
      desiredDirY += (dx / distToTarget) * 0.4 * this.strafeDir;
    } else {
      // Combat Engagement Mode
      if (distToTarget > this.config.attackRange) {
        // Approach target
        const normDist = Math.max(0.001, distToTarget);
        let approachX = dx / normDist;
        let approachY = dy / normDist;

        // Strafe circling behavior
        if (distToTarget < this.config.attackRange * 2.2 && Math.random() < this.config.strafeTendency) {
          const perpX = -approachY * this.strafeDir;
          const perpY = approachX * this.strafeDir;
          approachX = approachX * 0.6 + perpX * 0.8;
          approachY = approachY * 0.6 + perpY * 0.8;
        }

        desiredDirX = approachX;
        desiredDirY = approachY;
      } else {
        // Within attack range: circle or back off slightly to set up strike
        const normDist = Math.max(0.001, distToTarget);
        const perpX = (-dy / normDist) * this.strafeDir;
        const perpY = (dx / normDist) * this.strafeDir;
        desiredDirX = perpX;
        desiredDirY = perpY;
      }
    }

    // 6. Incoming Attack Dodge Evaluation
    if (target.isAttacking && distToTarget < this.config.attackRange + 25) {
      if (Math.random() < this.config.dodgeProbability) {
        // Dodge perpendicularly or dash away
        const normDist = Math.max(0.001, distToTarget);
        const perpX = -dy / normDist;
        const perpY = dx / normDist;
        desiredDirX = perpX * this.strafeDir;
        desiredDirY = perpY * this.strafeDir;

        // Opportunity to dash dodge
        if (self.dashCooldown <= 0 && Math.random() < this.config.dashProbability) {
          this.wantsDash = true;
        }
      }
    }

    // 7. Offense: Attack & Dash Engage
    if (distToTarget <= this.config.attackRange) {
      if (self.attackCooldown <= 0 && Math.random() < this.config.attackProbability) {
        this.wantsAttack = true;
      }
    } else if (distToTarget > 120 && distToTarget < 260) {
      // Dash engage if player is vulnerable or low HP
      if (
        self.dashCooldown <= 0 &&
        Math.random() < this.config.dashProbability * 0.6 &&
        !shouldRetreat
      ) {
        this.wantsDash = true;
      }
    }

    // 8. Combine vector forces: Desired Direction + Hazard Repel + Obstacle Repel
    let finalVx = desiredDirX + hazardRepelX * 1.8 + obstacleRepelX;
    let finalVy = desiredDirY + hazardRepelY * 1.8 + obstacleRepelY;
    const finalMag = Math.hypot(finalVx, finalVy);

    if (finalMag > 0.001) {
      this.currentMoveDir = {
        x: finalVx / finalMag,
        y: finalVy / finalMag,
      };
    } else {
      this.currentMoveDir = { x: 0, y: 0 };
    }
  }
}
