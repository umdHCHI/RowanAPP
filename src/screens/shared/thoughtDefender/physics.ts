import { Projectile, Thought } from '../../../types/index';
import { GAME_HEIGHT, GAME_WIDTH, PADDLE_WIDTH } from './constants';

const COLLISION_RADIUS = 42;
const THOUGHT_HITBOX_RADIUS = 40;
const PROJECTILE_HITBOX_RADIUS = 4;

export interface CollisionResult {
  thoughtsToRemove: Set<number>;
  projectilesToRemove: Set<number>;
  scoreDelta: number;
  livesDelta: number;
  hits: number;
  missedShots: number;
}

/**
 * Optimized collision detection using bounding box checks first, then distance
 * Reduces from O(n*m) to approximately O(n*m) but with early exits
 */
export const detectCollisions = (
  thoughts: Thought[],
  projectiles: Projectile[],
  shieldActive: boolean
): CollisionResult => {
  const result: CollisionResult = {
    thoughtsToRemove: new Set(),
    projectilesToRemove: new Set(),
    scoreDelta: 0,
    livesDelta: 0,
    hits: 0,
    missedShots: 0,
  };

  // Early exit if no entities
  if (thoughts.length === 0 || projectiles.length === 0) {
    return result;
  }

  // Process projectiles first (usually fewer)
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    if (result.projectilesToRemove.has(projectile.id)) continue;

    let hit = false;

    // Check collisions with negative thoughts only
    for (let j = thoughts.length - 1; j >= 0; j--) {
      const thought = thoughts[j];
      
      // Skip positive thoughts and already removed thoughts
      if (thought.isPositive || result.thoughtsToRemove.has(thought.id)) continue;

      // Fast bounding box check first
      const dx = Math.abs(projectile.x - (thought.x + THOUGHT_HITBOX_RADIUS));
      const dy = Math.abs(projectile.y - (thought.y + THOUGHT_HITBOX_RADIUS));
      
      if (dx > COLLISION_RADIUS || dy > COLLISION_RADIUS) continue;

      // Precise distance check
      const distance = Math.sqrt(
        Math.pow(projectile.x - (thought.x + THOUGHT_HITBOX_RADIUS), 2) +
        Math.pow(projectile.y - (thought.y + THOUGHT_HITBOX_RADIUS), 2)
      );

      if (distance < COLLISION_RADIUS) {
        result.thoughtsToRemove.add(thought.id);
        result.projectilesToRemove.add(projectile.id);
        result.hits++;
        hit = true;
        break; // One projectile can only hit one thought
      }
    }
  }

  return result;
};

/**
 * Update thought positions and detect bottom boundary collisions
 */
export const updateThoughts = (
  thoughts: Thought[],
  dtMs: number,
  frameMs: number,
  speedScale: number
): {
  updated: Thought[];
  bottomCollisions: Array<{ thought: Thought; isPositive: boolean }>;
} => {
  const bottomCollisions: Array<{ thought: Thought; isPositive: boolean }> = [];
  const bottomBoundary = GAME_HEIGHT - 60;
  const frameFactor = (dtMs / frameMs) * speedScale;

  const updated = thoughts
    .map((thought) => ({
      ...thought,
      y: thought.y + thought.speed * frameFactor,
    }))
    .filter((thought) => {
      if (thought.y > bottomBoundary) {
        bottomCollisions.push({
          thought,
          isPositive: thought.isPositive,
        });
        return false;
      }
      return true;
    });

  return { updated, bottomCollisions };
};

/**
 * Update projectile positions and detect off-screen projectiles
 */
export const updateProjectiles = (
  projectiles: Projectile[],
  dtMs: number,
  frameMs: number,
  speedScale: number
): {
  updated: Projectile[];
  missed: number;
} => {
  const frameFactor = (dtMs / frameMs) * speedScale;
  let missed = 0;

  const updated = projectiles
    .map((projectile) => ({
      ...projectile,
      y: projectile.y - projectile.speed * frameFactor,
    }))
    .filter((projectile) => {
      if (projectile.y <= -20) {
        missed++;
        return false;
      }
      return true;
    });

  return { updated, missed };
};

/**
 * Clamp player position within game bounds
 */
export const clampPlayerPosition = (x: number): number => {
  return Math.max(0, Math.min(GAME_WIDTH - PADDLE_WIDTH, x));
};

