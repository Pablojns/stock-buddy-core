import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVault, useTransferVaultToWish, useWithdrawVault } from '@/hooks/useVault';
import { useWishlist } from '@/hooks/useWishlist';
import { PiggyBank, ArrowRightLeft, Wallet } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function VaultDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: vault } = useVault();
  const { data: wishes = [] } = useWishlist();
  const transfer = useTransferVaultToWish();
  const withdraw = useWithdrawVault();

  const balance = Number(vault?.balance ?? 0);
  const [wishId, setWishId] = useState<string>('');
  const [transferAmt, setTransferAmt] = useState('');
  const [withdrawAmt, setWithdrawAmt] = useState('');

  const activeWishes = wishes.filter((w) => Number(w.saved_value) < Number(w.total_value));

  const handleTransfer = async () => {
    const amt = parseFloat(transferAmt);
    if (!wishId || !amt) return;
    await transfer.mutateAsync({ wishId, amount: amt });
    setTransferAmt(''); setWishId('');
    onOpenChange(false);
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmt);
    if (!amt) return;
    await withdraw.mutateAsync(amt);
    setWithdrawAmt('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-primary" />
            Cofre de Oportunidades
          </DialogTitle>
          <DialogDescription>
            Saldo disponível: <span className="font-semibold text-foreground">{fmt(balance)}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="transfer">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="transfer"><ArrowRightLeft className="w-4 h-4 mr-1" /> Transferir</TabsTrigger>
            <TabsTrigger value="withdraw"><Wallet className="w-4 h-4 mr-1" /> Resgatar</TabsTrigger>
          </TabsList>

          <TabsContent value="transfer" className="space-y-3 pt-3">
            <div>
              <Label>Sonho de destino</Label>
              {activeWishes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">Nenhum sonho ativo. Crie um na Fábrica de Sonhos.</p>
              ) : (
                <Select value={wishId} onValueChange={setWishId}>
                  <SelectTrigger><SelectValue placeholder="Escolha um sonho" /></SelectTrigger>
                  <SelectContent>
                    {activeWishes.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.title} — {fmt(Number(w.total_value) - Number(w.saved_value))} restantes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label>Valor</Label>
              <Input type="number" step="0.01" max={balance} value={transferAmt} onChange={(e) => setTransferAmt(e.target.value)} placeholder="0,00" />
            </div>
            <Button className="w-full" onClick={handleTransfer} disabled={!wishId || !transferAmt || transfer.isPending}>
              Injetar no sonho
            </Button>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-3 pt-3">
            <p className="text-sm text-muted-foreground">
              Move o valor de volta como receita no seu Saldo Total (ex: enviei para minha conta de investimentos).
            </p>
            <div>
              <Label>Valor</Label>
              <Input type="number" step="0.01" max={balance} value={withdrawAmt} onChange={(e) => setWithdrawAmt(e.target.value)} placeholder="0,00" />
            </div>
            <Button className="w-full" onClick={handleWithdraw} disabled={!withdrawAmt || withdraw.isPending}>
              Resgatar para saldo geral
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
