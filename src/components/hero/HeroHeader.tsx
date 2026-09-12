import { Shield } from 'lucide-react';
import { XP_PER_LEVEL, xpIntoLevel } from '@/lib/hero';

interface HeroHeaderProps {
  xp: number;
  level: number;
  rank: string;
  balance: number;
}

export function HeroHeader({ xp, level, rank, balance }: HeroHeaderProps) {
  const progress = (xpIntoLevel(xp) / XP_PER_LEVEL) * 100;

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-primary/50 bg-secondary">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold gold-text sm:text-lg">Life OS</h1>
            <p className="truncate text-xs text-muted-foreground">Diário do Herói · {rank}</p>
          </div>
          <div className="text-right">
            <div className="font-display text-xs text-muted-foreground">Nível</div>
            <div className="level-glow mx-auto mt-0.5 flex h-8 w-8 items-center justify-center rounded-sm border border-primary/60 bg-primary/15 font-display text-lg font-bold gold-text leading-none">
              {level}
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full border border-border bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 font-display text-[11px] text-muted-foreground">
            {xpIntoLevel(xp)}/{XP_PER_LEVEL} XP · saldo {balance}
          </span>
        </div>
      </div>
    </header>
  );
}
