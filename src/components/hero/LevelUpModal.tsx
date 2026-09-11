import { Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LevelUpModalProps {
  level: number | null;
  rank: string;
  onClose: () => void;
}

export function LevelUpModal({ level, rank, onClose }: LevelUpModalProps) {
  return (
    <Dialog open={level !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm border-primary/50 text-center parchment">
        <div className="animate-in fade-in zoom-in-95 duration-500 py-4">
          <Sparkles className="mx-auto h-10 w-10 animate-pulse text-primary" />
          <h2 className="mt-4 font-display text-2xl font-bold gold-text">NÍVEL {level}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Você evoluiu, Dovahkiin</p>
          <div className="rune-divider my-4" />
          <p className="text-sm">
            Novo rank: <span className="gold-text font-semibold">{rank}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">+3 pontos de atributo para distribuir</p>
          <Button className="mt-5 w-full" onClick={onClose}>
            Continuar a jornada
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
