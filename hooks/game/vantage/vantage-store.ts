import { createStore} from 'zustand/vanilla'
import { GAME_CONFIG } from '@/utils/vantage-constants'
import type {  Updater, VantageGameState, CreateVantageStoreParams, VantageGameStore } from '@/types/hooks'


function resolve<T>(next: Updater<T>, prev: T): T {
  return typeof next === 'function' ? (next as (value: T) => T)(prev) : next
}

export function createVantageGameStore({
  playerStartX,
  initialLives,
  initialFormationTickMs,
}: CreateVantageStoreParams): VantageGameStore {
  return createStore<VantageGameState>((set) => ({
    playerX: playerStartX,
    setPlayerX: (next) => set((state) => ({ playerX: resolve(next, state.playerX) })),
    score: GAME_CONFIG.INITIAL_SCORE,
    setScore: (next) => set((state) => ({ score: resolve(next, state.score) })),
    lives: initialLives,
    setLives: (next) => set((state) => ({ lives: resolve(next, state.lives) })),
    gameOver: false,
    setGameOver: (next) => set((state) => ({ gameOver: resolve(next, state.gameOver) })),
    isPlaying: false,
    setIsPlaying: (next) => set((state) => ({ isPlaying: resolve(next, state.isPlaying) })),
    projectiles: [],
    setProjectiles: (next) => set((state) => ({ projectiles: resolve(next, state.projectiles) })),
    enemyProjectiles: [],
    setEnemyProjectiles: (next) => set((state) => ({ enemyProjectiles: resolve(next, state.enemyProjectiles) })),
    negativeThoughts: [],
    setNegativeThoughts: (next) => set((state) => ({ negativeThoughts: resolve(next, state.negativeThoughts) })),
    powerUps: [],
    setPowerUps: (next) => set((state) => ({ powerUps: resolve(next, state.powerUps) })),
    boss: null,
    setBoss: (next) => set((state) => ({ boss: resolve(next, state.boss) })),
    bossIncoming: false,
    setBossIncoming: (next) => set((state) => ({ bossIncoming: resolve(next, state.bossIncoming) })),
    bossTelegraphActive: false,
    setBossTelegraphActive: (next) => set((state) => ({ bossTelegraphActive: resolve(next, state.bossTelegraphActive) })),
    bossTelegraphLabel: undefined,
    setBossTelegraphLabel: (next) => set((state) => ({ bossTelegraphLabel: resolve(next, state.bossTelegraphLabel) })),
    playerLastHitAt: 0,
    setPlayerLastHitAt: (next) => set((state) => ({ playerLastHitAt: resolve(next, state.playerLastHitAt) })),
    playerHp: initialLives,
    setPlayerHp: (next) => set((state) => ({ playerHp: resolve(next, state.playerHp) })),
    playerIFrameUntil: 0,
    setPlayerIFrameUntil: (next) => set((state) => ({ playerIFrameUntil: resolve(next, state.playerIFrameUntil) })),
    gameSpeed: GAME_CONFIG.DEFAULT_GAME_SPEED,
    setGameSpeed: (next) => set((state) => ({ gameSpeed: resolve(next, state.gameSpeed) })),
    multishotActive: false,
    setMultishotActive: (next) => set((state) => ({ multishotActive: resolve(next, state.multishotActive) })),
    fastShootActive: false,
    setFastShootActive: (next) => set((state) => ({ fastShootActive: resolve(next, state.fastShootActive) })),
    shieldActive: false,
    setShieldActive: (next) => set((state) => ({ shieldActive: resolve(next, state.shieldActive) })),
    debugHitboxes: false,
    setDebugHitboxes: (next) => set((state) => ({ debugHitboxes: resolve(next, state.debugHitboxes) })),
    thoughtEchoes: [],
    setThoughtEchoes: (next) => set((state) => ({ thoughtEchoes: resolve(next, state.thoughtEchoes) })),
    conqueredThoughts: [],
    setConqueredThoughts: (next) => set((state) => ({ conqueredThoughts: resolve(next, state.conqueredThoughts) })),
    defeatedNegativeThoughts: [],
    setDefeatedNegativeThoughts: (next) => set((state) => ({ defeatedNegativeThoughts: resolve(next, state.defeatedNegativeThoughts) })),
    fragments: [],
    setFragments: (next) => set((state) => ({ fragments: resolve(next, state.fragments) })),
    formationTickMs: initialFormationTickMs,
    setFormationTickMs: (next) => set((state) => ({ formationTickMs: resolve(next, state.formationTickMs) })),
    wave: 1,
    setWave: (next) => set((state) => ({ wave: resolve(next, state.wave) })),
    waveDefeatedPatterns: new Set(),
    setWaveDefeatedPatterns: (next) => set((state) => ({ waveDefeatedPatterns: resolve(next, state.waveDefeatedPatterns) })),
  }))
}
