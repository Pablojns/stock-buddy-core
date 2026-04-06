import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOrders, Order } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, CheckCircle2, Clock, Camera, Search, Plus, Loader2, Upload, AlertTriangle } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderCreateDialog } from '@/components/separacao/OrderCreateDialog';

export default function Separacao() {
  const { orders, loading, updateItemStatus, completeOrder, uploadPhoto } = useOrders();
  const [search, setSearch] = useState('');
  const [completeDialogOrder, setCompleteDialogOrder] = useState<Order | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const pendingOrders = useMemo(() =>
    orders.filter(o => o.status !== 'completed').filter(o =>
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.client_name.toLowerCase().includes(search.toLowerCase())
    ), [orders, search]);

  const completedOrders = useMemo(() =>
    orders.filter(o => o.status === 'completed'), [orders]);

  const todayOrders = useMemo(() =>
    pendingOrders.filter(o => isToday(parseISO(o.created_at))), [pendingOrders]);

  const allItemsChecked = (order: Order) =>
    order.items.length > 0 && order.items.every(i => i.is_separated && i.is_packed && i.is_shipped);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleComplete = async () => {
    if (!completeDialogOrder || !photoFile) return;
    setCompleting(true);
    const url = await uploadPhoto(photoFile);
    if (url) {
      await completeOrder(completeDialogOrder.id, url);
    }
    setCompleting(false);
    setCompleteDialogOrder(null);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const getProgress = (order: Order) => {
    if (order.items.length === 0) return 0;
    const total = order.items.length * 3;
    const done = order.items.reduce((acc, i) =>
      acc + (i.is_separated ? 1 : 0) + (i.is_packed ? 1 : 0) + (i.is_shipped ? 1 : 0), 0);
    return Math.round((done / total) * 100);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Separação de Pedidos</h1>
            <p className="text-muted-foreground text-sm">Sistema de picking logístico</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Novo Pedido
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pedidos Hoje', value: todayOrders.length, icon: Clock, color: 'text-accent' },
            { label: 'Pendentes', value: pendingOrders.length, icon: Package, color: 'text-warning' },
            { label: 'Concluídos', value: completedOrders.length, icon: CheckCircle2, color: 'text-[hsl(var(--success))]' },
            { label: 'Total Itens', value: pendingOrders.reduce((a, o) => a + o.items.length, 0), icon: Package, color: 'text-primary' },
          ].map((s, i) => (
            <Card key={i} className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar pedido ou cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card/50 border-border/50" />
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="pending">Pendentes ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Histórico ({completedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : pendingOrders.length === 0 ? (
              <Card className="bg-card/50 border-border/50"><CardContent className="py-12 text-center text-muted-foreground">Nenhum pedido pendente</CardContent></Card>
            ) : (
              <AnimatePresence>
                {pendingOrders.map((order, idx) => (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: idx * 0.05 }}>
                    <Card className="bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-base font-semibold text-foreground">#{order.order_number}</CardTitle>
                            <Badge variant="outline" className="text-xs">{order.client_name}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getProgress(order) === 100 ? 'bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]' : 'bg-warning/20 text-warning'}`}>
                              {getProgress(order)}% concluído
                            </Badge>
                            <span className="text-xs text-muted-foreground">{format(parseISO(order.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                          <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${getProgress(order)}%` }} />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ScrollArea className="max-h-[300px]">
                          <div className="space-y-2">
                            {order.items.map(item => (
                              <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 border border-border/30">
                                {item.product_image ? (
                                  <img src={item.product_image} alt={item.product_name} className="w-12 h-12 rounded-lg object-cover border border-border/50" />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{item.product_name}</p>
                                  <p className="text-xs text-muted-foreground">{item.product_code} · Qtd: {item.quantity}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <Checkbox checked={item.is_separated} onCheckedChange={(v) => updateItemStatus(item.id, 'is_separated', !!v)} />
                                    <span className="text-xs text-muted-foreground">Separado</span>
                                  </label>
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <Checkbox checked={item.is_packed} onCheckedChange={(v) => updateItemStatus(item.id, 'is_packed', !!v)} />
                                    <span className="text-xs text-muted-foreground">Embalado</span>
                                  </label>
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <Checkbox checked={item.is_shipped} onCheckedChange={(v) => updateItemStatus(item.id, 'is_shipped', !!v)} />
                                    <span className="text-xs text-muted-foreground">Expedido</span>
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        {allItemsChecked(order) && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex justify-end">
                            <Button onClick={() => setCompleteDialogOrder(order)} className="gap-2 bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90 text-[hsl(var(--success-foreground))]">
                              <Camera className="h-4 w-4" /> Concluir Pedido
                            </Button>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
              <Card className="bg-card/50 border-border/50"><CardContent className="py-12 text-center text-muted-foreground">Nenhum pedido concluído</CardContent></Card>
            ) : completedOrders.map(order => (
              <Card key={order.id} className="bg-card/50 border-border/50 opacity-80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
                      <span className="font-semibold text-foreground">#{order.order_number}</span>
                      <Badge variant="outline" className="text-xs">{order.client_name}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      {order.photo_url && (
                        <a href={order.photo_url} target="_blank" rel="noopener noreferrer">
                          <Badge className="bg-primary/20 text-primary cursor-pointer gap-1"><Camera className="h-3 w-3" />Foto</Badge>
                        </a>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {order.completed_at && format(parseISO(order.completed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{order.items.length} item(ns) · {order.items.reduce((a, i) => a + i.quantity, 0)} unidade(s)</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Complete Dialog */}
      <Dialog open={!!completeDialogOrder} onOpenChange={() => { setCompleteDialogOrder(null); setPhotoFile(null); setPhotoPreview(null); }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Concluir Pedido #{completeDialogOrder?.order_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
              <p className="text-sm text-warning">Anexe uma foto do pedido embalado para concluir.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full max-h-48 object-cover rounded-lg border border-border" />
              ) : (
                <label className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Clique para anexar foto</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                </label>
              )}
              {photoPreview && (
                <Button variant="outline" size="sm" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}>Trocar foto</Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCompleteDialogOrder(null); setPhotoFile(null); setPhotoPreview(null); }}>Cancelar</Button>
            <Button onClick={handleComplete} disabled={!photoFile || completing} className="gap-2 bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90">
              {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OrderCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </DashboardLayout>
  );
}
