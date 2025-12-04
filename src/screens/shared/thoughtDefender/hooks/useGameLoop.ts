import { useCallback, useEffect, useRef } from 'react';
import { DifficultyConfig, GameState, Projectile, Thought } from '../../../../types/index';
import { FRAME_MS } from '../constants';
import { detectCollisions, updateProjectiles, updateThoughts } from '../physics';

interface UseGameLoopProps {
  gameStarted: boolean;
  lives: number;
  gameState: GameState;
  thoughts: Thought[];
  projectiles: Projectile[];
  setThoughts: React.Dispatch<React.SetStateAction<Thought[]>>;
  setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setLives: React.Dispatch<React.SetStateAction<number>>;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  setMissedShots: React.Dispatch<React.SetStateAction<number>>;
  setNegativeThoughtsCleared: React.Dispatch<React.SetStateAction<number>>;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  getDifficultyConfig: () => DifficultyConfig;
  logger: any;
  level: number;
  onThoughtDefeated?: (thoughtText: string) => void;
  onEnemyDefeated?: (position: { x: number; y: number }, text: string) => void;
}

/**
 * Optimized game loop hook that batches updates and uses efficient physics
 */
export const useGameLoop = ({
  gameStarted,
  lives,
  gameState,
  thoughts,
  projectiles,
  setThoughts,
  setProjectiles,
  setScore,
  setLives,
  setHits,
  setMissedShots,
  setNegativeThoughtsCleared,
  setGameState,
  getDifficultyConfig,
  logger,
  level,
  onThoughtDefeated,
  onEnemyDefeated,
}: UseGameLoopProps) => {
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const thoughtsRef = useRef<Thought[]>(thoughts);
  const projectilesRef = useRef<Projectile[]>(projectiles);
  const gameStateRef = useRef<GameState>(gameState);
  const livesRef = useRef<number>(lives);
  const gameStartedRef = useRef<boolean>(gameStarted);

  // Sync refs with state (minimal overhead)
  useEffect(() => {
    thoughtsRef.current = thoughts;
  }, [thoughts]);

  useEffect(() => {
    projectilesRef.current = projectiles;
  }, [projectiles]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  useEffect(() => {
    gameStartedRef.current = gameStarted;
  }, [gameStarted]);

  const updateGame = useCallback(
    (dtMs: number = FRAME_MS): void => {
      if (!gameStartedRef.current || livesRef.current <= 0) {
        return;
      }

      const currentGameState = gameStateRef.current;
      const speedScale = currentGameState.timeSlowActive ? 0.5 : 1;
      const difficulty = getDifficultyConfig();
      const missedPenalty = Math.floor(5 * difficulty.modifiers.scoreMultiplier);

      // Batch all updates into a single state update cycle
      let scoreDelta = 0;
      let livesDelta = 0;
      let hitsDelta = 0;
      let missedDelta = 0;
      let negativeThoughtsDelta = 0;
      let thoughtsClearedDelta = 0;

      // Update thoughts
      const { updated: updatedThoughts, bottomCollisions } = updateThoughts(
        thoughtsRef.current,
        dtMs,
        FRAME_MS,
        speedScale
      );

      // Process bottom collisions
      for (const { thought, isPositive } of bottomCollisions) {
        if (!isPositive && !currentGameState.shieldActive) {
          livesDelta -= 1;
          logger.playerHit(level, 1, livesRef.current + livesDelta);
        }
        if (!isPositive) {
          negativeThoughtsDelta += 1;
        }
        thoughtsClearedDelta += 1;
      }

      // Detect collisions between projectiles and thoughts
      const collisionResult = detectCollisions(
        updatedThoughts,
        projectilesRef.current,
        currentGameState.shieldActive
      );

      // Process collision results
      if (collisionResult.hits > 0) {
        const basePoints = 15 * difficulty.modifiers.scoreMultiplier;
        const points = Math.round(basePoints * currentGameState.scoreMultiplier * collisionResult.hits);
        scoreDelta += points;
        hitsDelta += collisionResult.hits;
        negativeThoughtsDelta += collisionResult.hits;
        thoughtsClearedDelta += collisionResult.hits;
        
        // Track unique thoughts defeated and trigger confetti
        if (onThoughtDefeated || onEnemyDefeated) {
          collisionResult.thoughtsToRemove.forEach((thoughtId) => {
            const thought = updatedThoughts.find(t => t.id === thoughtId);
            if (thought && !thought.isPositive) {
              if (onThoughtDefeated) {
                onThoughtDefeated(thought.text);
              }
              // Trigger confetti animation at enemy position
              if (onEnemyDefeated) {
                onEnemyDefeated({ x: thought.x, y: thought.y }, thought.text);
              }
            }
          });
        }
        
        logger.enemyDestroyed(level, 'thought', points);
      }

      // Update projectiles
      const { updated: updatedProjectiles, missed } = updateProjectiles(
        projectilesRef.current.filter(
          (p) => !collisionResult.projectilesToRemove.has(p.id)
        ),
        dtMs,
        FRAME_MS,
        currentGameState.fastShootActive ? 1.2 : 1
      );

      // Process missed shots
      if (missed > 0) {
        missedDelta += missed;
        scoreDelta -= missedPenalty * missed;
      }

      // Batch all state updates - always update thoughts to reflect position changes
      // Filter out removed thoughts and update state
      // Since thoughts move every frame, we always need to update the state
      const filteredThoughts = updatedThoughts.filter((t) => !collisionResult.thoughtsToRemove.has(t.id));
      
      // Always update thoughts - positions change every frame so we need to trigger re-render
      // Create new array reference to ensure React detects the change
      setThoughts([...filteredThoughts]);

      // Always update projectiles - positions change every frame
      setProjectiles([...updatedProjectiles]);

      // Apply batched deltas
      if (scoreDelta !== 0) {
        setScore((prev) => Math.max(0, prev + scoreDelta));
      }

      if (livesDelta !== 0) {
        setLives((prev) => Math.max(0, prev + livesDelta));
      }

      if (hitsDelta > 0) {
        setHits((prev) => prev + hitsDelta);
      }

      if (missedDelta > 0) {
        setMissedShots((prev) => prev + missedDelta);
      }

      if (negativeThoughtsDelta > 0) {
        setNegativeThoughtsCleared((prev) => prev + negativeThoughtsDelta);
      }

      if (thoughtsClearedDelta > 0) {
        setGameState((prev) => ({
          ...prev,
          thoughtsCleared: prev.thoughtsCleared + thoughtsClearedDelta,
        }));
      }
    },
    [
      getDifficultyConfig,
      logger,
      level,
      onThoughtDefeated,
      onEnemyDefeated,
      setThoughts,
      setProjectiles,
      setScore,
      setLives,
      setHits,
      setMissedShots,
      setNegativeThoughtsCleared,
      setGameState,
    ]
  );

  const stepGame = useCallback(
    (ts: number) => {
      if (!gameStartedRef.current || livesRef.current <= 0) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        return;
      }

      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dtMsRaw = ts - lastTsRef.current;
      lastTsRef.current = ts;

      // Clamp delta time to prevent large jumps
      const dtMs = Math.max(0, Math.min(dtMsRaw, 100));

      updateGame(dtMs);
      rafRef.current = requestAnimationFrame(stepGame);
    },
    [updateGame]
  );

  // Start/stop game loop
  useEffect(() => {
    if (!gameStarted) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTsRef.current = null;
      return;
    }

    lastTsRef.current = null;
    rafRef.current = requestAnimationFrame(stepGame);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [gameStarted, stepGame]);

  return { updateGame };
};

