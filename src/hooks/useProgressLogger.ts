import { useCallback, useEffect, useRef } from 'react';
import { apiService, LogPlayerProgressPayload, TDProgressEvent } from '../services/apiService';

function safeSessionId() {
    // use crypto.randomUUID if available; fallback to timestamp-rand
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return (crypto as any).randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useProgressLogger(opts: {
    game: 'thought_defender';
    flushIntervalMs?: number; // default 4000
    maxBuffer?: number; // default 200 (starts dropping oldest)
}) {
    const { game, flushIntervalMs = 4000, maxBuffer = 200 } = opts;
    const sessionIdRef = useRef<string>(safeSessionId());
    const bufferRef = useRef<TDProgressEvent[]>([]);
    const isFlushingRef = useRef(false);
    const timerRef = useRef<number | null>(null);

    const enqueue = useCallback((e: TDProgressEvent) => {
        const buf = bufferRef.current;
        buf.push(e);
        if (buf.length > maxBuffer) {
            buf.splice(0, buf.length - maxBuffer); // drop oldest
        }
    }, [maxBuffer]);

    const flush = useCallback(async () => {
        if (isFlushingRef.current) return;
        const events = bufferRef.current;
        if (!events.length) return;

        isFlushingRef.current = true;
        const payload: LogPlayerProgressPayload = {
            game,
            events: [...events]
        };

        try {
            // Convert TDProgressEvent[] to the expected format
            const convertedEvents = events.map(event => ({
                type: event.type,
                t: event.client_ts,
                data: event
            }));
            const result = await apiService.logPlayerProgress(convertedEvents);
            if (result.ok) {
                // clear only if success
                bufferRef.current = [];
            }
        } catch {
            // keep buffer to retry on next tick
        } finally {
            isFlushingRef.current = false;
        }
    }, [game]);

    const start = useCallback((difficulty: 'ZEN' | 'BALANCED' | 'INTENSE' | 'NIGHTMARE') => {
        sessionIdRef.current = safeSessionId();
        enqueue({
            type: 'session_start',
            session_id: sessionIdRef.current,
            difficulty,
            started_at: new Date().toISOString(),
            client_ts: Date.now(),
        });

        if (!timerRef.current) {
            // @ts-ignore setInterval typing in RN/web
            timerRef.current = setInterval(flush, flushIntervalMs) as unknown as number;
        }
    }, [enqueue, flush, flushIntervalMs]);

    const end = useCallback((final: {
        duration_ms: number;
        waves_cleared: number;
        kills: number;
        score: number;
        difficulty: 'ZEN' | 'BALANCED' | 'INTENSE' | 'NIGHTMARE';
        quit_reason?: 'completed' | 'dead' | 'quit';
        accuracy?: number;
        damage_taken?: number;
    }) => {
        enqueue({
            type: 'session_end',
            session_id: sessionIdRef.current,
            ended_at: new Date().toISOString(),
            client_ts: Date.now(),
            ...final,
        });

        // force a last flush shortly after
        setTimeout(() => flush(), 250);
    }, [enqueue, flush]);

    const waveStart = useCallback((wave: number) => {
        enqueue({
            type: 'wave_start',
            session_id: sessionIdRef.current,
            wave,
            client_ts: Date.now()
        });
    }, [enqueue]);

    const enemyDestroyed = useCallback((wave: number, enemy_type: 'thought' | 'boss', points: number) => {
        enqueue({
            type: 'enemy_destroyed',
            session_id: sessionIdRef.current,
            wave,
            enemy_type,
            points,
            client_ts: Date.now()
        });
    }, [enqueue]);

    const playerHit = useCallback((wave: number, damage: number, remaining_hp: number) => {
        enqueue({
            type: 'player_hit',
            session_id: sessionIdRef.current,
            wave,
            damage,
            remaining_hp,
            client_ts: Date.now()
        });
    }, [enqueue]);

    const powerupCollected = useCallback((wave: number, powerup_id: string) => {
        enqueue({
            type: 'powerup_collected',
            session_id: sessionIdRef.current,
            wave,
            powerup_id,
            client_ts: Date.now()
        });
    }, [enqueue]);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current as unknown as number);
            }
            timerRef.current = null;
            // best-effort final flush
            flush();
        };
    }, [flush]);

    return {
        start,
        end,
        waveStart,
        enemyDestroyed,
        playerHit,
        powerupCollected,
        sessionId: () => sessionIdRef.current,
        flushNow: flush,
    };
}
