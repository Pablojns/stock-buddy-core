import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Truck, ChevronRight } from 'lucide-react';
import { Order, OrderStatus, ORDER_STATUS_CONFIG, ORDER_STATUS_FLOW } from '@/types/orders';

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onGeneratePDF: (order: Order) => void;
}

export function OrderDetailDialog({ open, onOpenChange, order, onStatusChange, onGeneratePDF }: OrderDetailDialogProps) {
  if (!order) return null;

  const cfg = ORDER_STATUS_CONFIG[order.status];
  const currentIdx = ORDER_STATUS_FLOW.indexOf(order.status);
  const canAdvance = currentIdx >= 0 && currentIdx < ORDER_STATUS_FLOW.length - 1 && order.status !== 'cancelled';
  const nextStatus = canAdvance ? ORDER_STATUS_FLOW[currentIdx + 1] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            {order.orderNumber}
            <Badge className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Status flow */}
          <div className="flex items-center gap-1 flex-wrap text-xs">
            {ORDER_STATUS_FLOW.map((s, i) => {
              const sc = ORDER_STATUS_CONFIG[s];
              const isActive = s === order.status;
              const isPast = ORDER_STATUS_FLOW.indexOf(order.status) >= i;
              return (
                <span key={s} className="flex items-center gap-1">
                  <span className={`px-2 py-1 rounded-md ${isActive ? sc.color + ' font-semibold' : isPast ? 'bg-muted text-foreground' : 'bg-muted/50 text-muted-foreground'}`}>
                    {sc.label}
                  </span>
                  {i < ORDER_STATUS_FLOW.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                </span>
              );
            })}
          </div>

          {/* Client info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Cliente</p>
              <p className="font-medium">{order.clientName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">CPF/CNPJ</p>
              <p className="font-mono">{order.clientDocument}</p>
            </div>
          </div>

          {/* Address */}
          <div className="text-sm">
            <p className="text-muted-foreground text-xs mb-1">Endereço</p>
            <p>{order.address.street}, {order.address.number} {order.address.complement && `- ${order.address.complement}`}</p>
            <p>{order.address.neighborhood} - {order.address.city}/{order.address.state} - CEP {order.address.zipCode}</p>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <p className="text-sm font-semibold mb-2">Produtos</p>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">Código</TableHead>
                  <TableHead className="text-xs">Produto</TableHead>
                  <TableHead className="text-xs text-right">Qtd</TableHead>
                  <TableHead className="text-xs text-right">Unitário</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{item.productCode}</TableCell>
                    <TableCell className="text-sm">{item.productName}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">R$ {item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">R$ {item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="text-right mt-2">
              <span className="text-lg font-bold">Total: R$ {order.totalValue.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          {/* Shipping info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Nota Fiscal</p>
              <p className="font-mono">{order.invoice || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Transportadora</p>
              <p>{order.carrier || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Data de Envio</p>
              <p>{order.shippingDate || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Rastreio</p>
              <p className="font-mono">{order.trackingCode || '—'}</p>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {canAdvance && nextStatus && (
              <Button size="sm" className="gap-1.5" onClick={() => onStatusChange(order.id, nextStatus)}>
                <ChevronRight className="w-4 h-4" /> Avançar para {ORDER_STATUS_CONFIG[nextStatus].label}
              </Button>
            )}
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <Button size="sm" variant="destructive" onClick={() => onStatusChange(order.id, 'cancelled')}>
                Cancelar Pedido
              </Button>
            )}
            <Select onValueChange={(v) => onStatusChange(order.id, v as OrderStatus)} value={order.status}>
              <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.entries(ORDER_STATUS_CONFIG) as [OrderStatus, { label: string }][]).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" className="gap-1.5 ml-auto" onClick={() => onGeneratePDF(order)}>
              <FileText className="w-4 h-4" /> Gerar PDF
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Criado: {new Date(order.createdAt).toLocaleString('pt-BR')} · Atualizado: {new Date(order.updatedAt).toLocaleString('pt-BR')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
