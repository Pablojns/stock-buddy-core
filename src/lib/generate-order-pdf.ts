import { Order } from '@/types/orders';
import { ORDER_STATUS_CONFIG } from '@/types/orders';

export function generateOrderPDF(order: Order) {
  const statusLabel = ORDER_STATUS_CONFIG[order.status].label;

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:11px">${item.productCode}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">${item.productName}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:center">${item.quantity}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right">R$ ${item.unitPrice.toFixed(2)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">R$ ${item.total.toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Pedido ${order.orderNumber}</title>
<style>
  body{font-family:system-ui,sans-serif;margin:0;padding:40px;color:#1a1a2e;font-size:13px}
  h1{font-size:22px;margin:0}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;border-bottom:3px solid #1a365d;padding-bottom:20px}
  .badge{background:#1a365d;color:white;padding:4px 12px;border-radius:6px;font-size:11px;font-weight:600}
  .section{margin-bottom:20px}
  .section-title{font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{background:#f1f5f9;padding:8px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.3px}
  .total-row{font-size:16px;font-weight:700;text-align:right;padding-top:12px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .field-label{font-size:11px;color:#64748b}
  .field-value{font-weight:500}
  @media print{body{padding:20px}}
</style></head><body>
<div class="header">
  <div>
    <h1>Pedido ${order.orderNumber}</h1>
    <p style="color:#64748b;margin:4px 0">Emitido em ${new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
  </div>
  <span class="badge">${statusLabel}</span>
</div>

<div class="grid" style="margin-bottom:24px">
  <div class="section">
    <div class="section-title">Cliente</div>
    <p class="field-value">${order.clientName}</p>
    <p>CPF/CNPJ: ${order.clientDocument}</p>
  </div>
  <div class="section">
    <div class="section-title">Endereço</div>
    <p>${order.address.street}, ${order.address.number} ${order.address.complement ? '- ' + order.address.complement : ''}</p>
    <p>${order.address.neighborhood} - ${order.address.city}/${order.address.state}</p>
    <p>CEP: ${order.address.zipCode}</p>
  </div>
</div>

<div class="section">
  <div class="section-title">Produtos</div>
  <table>
    <thead><tr>
      <th>Código</th><th>Produto</th><th style="text-align:center">Qtd</th><th style="text-align:right">Unitário</th><th style="text-align:right">Total</th>
    </tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="total-row">Total: R$ ${order.totalValue.toFixed(2)}</div>
</div>

<div class="grid" style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb">
  <div class="section">
    <div class="section-title">Faturamento</div>
    <p><span class="field-label">Nota Fiscal:</span> ${order.invoice || '—'}</p>
  </div>
  <div class="section">
    <div class="section-title">Envio</div>
    <p><span class="field-label">Transportadora:</span> ${order.carrier || '—'}</p>
    <p><span class="field-label">Data de Envio:</span> ${order.shippingDate || '—'}</p>
    <p><span class="field-label">Rastreio:</span> ${order.trackingCode || '—'}</p>
  </div>
</div>

</body></html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
}
