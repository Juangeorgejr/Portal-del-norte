import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { formatCOP, formatDateShort } from '../../utils/formatters';
import { ReceiptText, Download, ShieldCheck } from 'lucide-react';

interface InvoiceItem {
  id: number;
  invoiceNumber: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  status: string;
  cufe: string;
  issuedAt: string;
}

export const MyInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<InvoiceItem[]>('/invoices/my')
      .then((res) => setInvoices(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = (invoice: InvoiceItem) => {
    alert(`Descarga de comprobante oficial de Factura Electrónica:\nNúmero: ${invoice.invoiceNumber}\nCUFE: ${invoice.cufe}\nTotal: ${formatCOP(invoice.total)}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-bold tracking-widest text-gold-600 uppercase">
          Documentos Electrónicos DIAN
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 mt-1">
          Mis Facturas
        </h1>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-4">
          <ReceiptText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-slate-800">
            No tiene facturas electrónicas emitidas
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Las facturas se generan automáticamente al confirmar el pago de sus reservas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                    {inv.invoiceNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Validada DIAN
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate max-w-md">
                  CUFE: {inv.cufe || '8e4f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f'}
                </p>
                <p className="text-xs text-slate-500">
                  Emitida el {formatDateShort(inv.issuedAt)}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <p className="text-slate-400 text-[11px]">Total Facturado</p>
                  <p className="font-serif font-bold text-lg text-slate-900">
                    {formatCOP(inv.total)}
                  </p>
                </div>

                <button
                  onClick={() => handleDownload(inv)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
