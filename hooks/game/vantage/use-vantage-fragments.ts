import { useCallback } from 'react'
import { GAME_CONFIG } from '@/utils/vantage-constants'
import { THOUGHT_PATTERNS, type ThoughtPattern } from '@/utils/vantage-helpers'
import type { Fragment, NegativeThought } from '@/types/game'
import type {  FragmentSystemOptions } from '@/types/hooks'
import type { UseVantageFragmentsResult } from '@/types/hooks'



export function useVantageFragments({
  store,
  gameWidth,
  gameHeight,
  director,
  playerXRef,
  getPlayerY,
  fragmentTTLRef,
  fragmentGlobalCooldownRef,
  fragmentPhraseCooldownRef,
}: FragmentSystemOptions) {
  const spawnFragments = useCallback(
    (thought: NegativeThought) => {
      const { setFragments, fragments } = store.getState()
      const now = Date.now()

      if (fragments.length >= 2) {
        return
      }

      if (now - fragmentGlobalCooldownRef.current < 700) {
        return
      }

      let pattern: ThoughtPattern | undefined
      if (thought.patternId) {
        pattern = THOUGHT_PATTERNS.find((p: ThoughtPattern) => p.id === thought.patternId)
      }
      if (!pattern) {
        const availablePatterns = THOUGHT_PATTERNS.filter(
          (p: ThoughtPattern) => p.monsterKey === 'void_eater'
        )
        if (availablePatterns.length > 0) {
          pattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)]
        }
      }
      if (!pattern) return

      const phraseKey = pattern.phrase
      const lastSpawnAt = fragmentPhraseCooldownRef.current.get(phraseKey)
      if (lastSpawnAt && now - lastSpawnAt < 2000) {
        return
      }

      const wellnessProbability = director.getWellnessProbability()
      const isWellness = Math.random() < wellnessProbability
      const kind: 'negative' | 'wellness' = isWellness ? 'wellness' : 'negative'

      const text = kind === 'wellness'
        ? (pattern.counterRecord.length <= 40 ? pattern.counterRecord : 'Try a kinder thought')
        : (pattern.phrase.length <= 30 ? pattern.phrase : pattern.phrase.substring(0, 27) + '...')

      const bubbleMaxWidth = 200
      let fragmentX = thought.x + GAME_CONFIG.THOUGHT_WIDTH / 2
      let fragmentY = thought.y
      fragmentX = Math.max(8, Math.min(fragmentX, gameWidth - bubbleMaxWidth - 8))

      const fragment: Fragment = {
        id: `fragment-${thought.id}-${Date.now()}`,
        x: fragmentX,
        y: fragmentY,
        text,
        ttlMs: 4000 + Math.random() * 2000,
        kind,
        patternId: pattern.id,
        phrase: pattern.phrase,
        counterRecord: pattern.counterRecord,
      }

      fragmentTTLRef.current.set(fragment.id, Date.now() + fragment.ttlMs)
      fragmentGlobalCooldownRef.current = now
      fragmentPhraseCooldownRef.current.set(phraseKey, now)

      setFragments((prev) => [...prev, fragment].slice(-2))
    },
    [
      director,
      fragmentGlobalCooldownRef,
      fragmentPhraseCooldownRef,
      fragmentTTLRef,
      gameWidth,
      store,
    ]
  )

  const spawnHitFragment = useCallback(() => {
    const { setFragments, fragments } = store.getState()
    const now = Date.now()

    if (fragments.length >= 2) {
      return
    }

    if (now - fragmentGlobalCooldownRef.current < 700) {
      return
    }

    const availablePatterns = THOUGHT_PATTERNS.filter(
      (p: ThoughtPattern) => p.monsterKey === 'void_eater'
    )
    if (availablePatterns.length === 0) return

    const pattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)]
    const phraseKey = pattern.phrase
    const lastSpawnAt = fragmentPhraseCooldownRef.current.get(phraseKey)
    if (lastSpawnAt && now - lastSpawnAt < 2000) {
      return
    }

    const bubbleMaxWidth = 220
    const playerY = getPlayerY()
    const fragmentX = Math.max(8, Math.min(playerXRef.current, gameWidth - bubbleMaxWidth - 8))
    const fragmentY = Math.max(60, Math.min(playerY - 80, gameHeight * 0.35))

    const fragment: Fragment = {
      id: `fragment-hit-${Date.now()}`,
      x: fragmentX,
      y: fragmentY,
      text: pattern.phrase.length <= 30 ? pattern.phrase : pattern.phrase.substring(0, 27) + '...',
      ttlMs: 900 + Math.random() * 200,
      kind: 'negative',
      patternId: pattern.id,
      phrase: pattern.phrase,
      counterRecord: pattern.counterRecord,
    }

    fragmentTTLRef.current.set(fragment.id, Date.now() + fragment.ttlMs)
    fragmentGlobalCooldownRef.current = now
    fragmentPhraseCooldownRef.current.set(phraseKey, now)

      setFragments((prev) => [...prev, fragment].slice(-2))
  }, [
    fragmentGlobalCooldownRef,
    fragmentPhraseCooldownRef,
    fragmentTTLRef,
    gameHeight,
    gameWidth,
    getPlayerY,
    playerXRef,
    store,
  ])

  const updateFragments = useCallback((_deltaTime?: number) => {
    const { setFragments } = store.getState()
    const now = Date.now()
    setFragments((prev) =>
      prev.filter((fragment) => {
        const ttl = fragmentTTLRef.current.get(fragment.id)
        if (ttl && now >= ttl) {
          fragmentTTLRef.current.delete(fragment.id)
          return false
        }
        return true
      })
    )
  }, [fragmentTTLRef, store])

  const handleFragmentTap = useCallback(
    (fragmentId: string) => {
      const { setFragments, setConqueredThoughts, fragments } = store.getState()
      const fragment = fragments.find((f) => f.id === fragmentId)
      if (!fragment) return

      if (fragment.kind === 'wellness') {
        setConqueredThoughts((prev) => {
          if (prev.some((ct) => ct.id === fragment.patternId)) {
            return prev
          }
          return [
            ...prev,
            {
              id: fragment.patternId,
              phrase: fragment.phrase,
              counterRecord: fragment.counterRecord,
            },
          ]
        })
        setFragments((prev) => prev.filter((f) => f.id !== fragmentId))
        fragmentTTLRef.current.delete(fragmentId)
      } else {
        setFragments((prev) =>
          prev.map((f) =>
            f.id === fragmentId
              ? {
                  ...f,
                  kind: 'wellness' as const,
                  text:
                    f.counterRecord.length <= 40
                      ? f.counterRecord
                      : 'Try a kinder thought',
                }
              : f
          )
        )
      }
    },
    [store, fragmentTTLRef]
  )

  return {
    spawnFragments,
    spawnHitFragment,
    updateFragments,
    handleFragmentTap,
  } satisfies UseVantageFragmentsResult
}
