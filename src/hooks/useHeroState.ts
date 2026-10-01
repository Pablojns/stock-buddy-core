import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  HeroState,
  initialState,
  levelFromXp,
  rankFromLevel,
} from '@/lib/hero';

const STORAGE_KEY = 'life-os-hero-diary';

function getSafeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function load(): HeroState {
  try {
    const storage = getSafeStorage();
    if (!storage) return initialState;
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return { ...initialState, ...(JSON.parse(raw) as Partial<HeroState>) };
  } catch {
    return initialState;
  }
}

export function useHeroState() {
  const [state, setState] = useState<HeroState>(load);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const levelRef = useRef(levelFromXp(state.xp));

  useEffect(() => {
    const storage = getSafeStorage();
    if (storage) {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    const level = levelFromXp(state.xp);
    if (level > levelRef.current) {
      setLevelUp(level);
      setState((s) => ({ ...s, points: s.points + 3 }));
    }
    levelRef.current = level;
  }, [state.xp]);

  const grantXp = useCallback((amount: number, label: string) => {
    setState((s) => ({ ...s, xp: s.xp + amount }));
    toast.success(label, { description: `+${amount} XP conquistado` });
  }, []);

  const level = levelFromXp(state.xp);
  const rank = rankFromLevel(level);
  const balance = state.xp - state.spent;

  return {
    state,
    setState,
    grantXp,
    level,
    rank,
    balance,
    levelUp,
    dismissLevelUp: () => setLevelUp(null),
  };
}

export type HeroStore = ReturnType<typeof useHeroState>;
