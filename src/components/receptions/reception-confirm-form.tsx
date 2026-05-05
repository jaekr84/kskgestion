"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { ClipboardCheck, ChevronRight, MapPin, Truck, AlertTriangle, ScanBarcode, Check } from "lucide-react";
import { confirmReceptionAction } from "@/lib/actions/receptions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ReceptionItemState {
  itemId: number;
  productId: number;
  productName: string;
  productSku: string | null;
  productBarcode: string | null;
  expectedQuantity: number;
  receivedQuantity: number;
  notes: string;
  lastScannedAt: number | null; // timestamp for flash animation
}

export function ReceptionConfirmForm({
  reception,
  open,
  onOpenChange,
}: {
  reception: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const isPending = reception.status === "pendiente";
  const [isLoading, setIsLoading] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const scanRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<ReceptionItemState[]>(
    reception.items.map((item: any) => ({
      itemId: item.id,
      productId: item.productId,
      productName: item.product?.name || "Producto",
      productSku: item.product?.sku || null,
      productBarcode: item.product?.barcode || null,
      expectedQuantity: item.expectedQuantity,
      receivedQuantity: item.receivedQuantity ?? (isPending ? 0 : item.expectedQuantity),
      notes: item.notes || "",
      lastScannedAt: null,
    }))
  );

  const [generalNotes, setGeneralNotes] = useState("");

  // Auto-focus scan input when modal opens
  useEffect(() => {
    if (open && isPending) {
      setTimeout(() => scanRef.current?.focus(), 300);
    }
  }, [open, isPending]);



  const totalExpected = items.reduce((a, i) => a + i.expectedQuantity, 0);
  const totalReceived = items.reduce((a, i) => a + i.receivedQuantity, 0);
  const progressPercent = totalExpected > 0 ? Math.round((totalReceived / totalExpected) * 100) : 0;
  const hasDiscrepancy = items.some(i => i.receivedQuantity !== i.expectedQuantity && i.receivedQuantity > 0);

  const handleScan = useCallback((code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    // Find matching item by barcode, SKU, or partial name
    const match = items.find(i =>
      (i.productBarcode && i.productBarcode.toLowerCase() === trimmed.toLowerCase()) ||
      (i.productSku && i.productSku.toLowerCase() === trimmed.toLowerCase())
    );

    if (!match) {
      toast.error(`Código "${trimmed}" no encontrado en esta recepción`);
      setScanInput("");
      scanRef.current?.focus();
      return;
    }

    if (match.receivedQuantity >= match.expectedQuantity) {
      toast.warning(`${match.productName} supera lo esperado (${match.receivedQuantity + 1}/${match.expectedQuantity})`);
    } else {
      toast.success(`+1 ${match.productName} (${match.receivedQuantity + 1}/${match.expectedQuantity})`);
    }

    // Increment received quantity
    setItems(prev => prev.map(i =>
      i.itemId === match.itemId
        ? { ...i, receivedQuantity: i.receivedQuantity + 1, lastScannedAt: Date.now() }
        : i
    ));

    setScanInput("");
    scanRef.current?.focus();
  }, [items]);

  const handleScanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleScan(scanInput);
    }
  };

  const updateItem = (idx: number, field: "receivedQuantity" | "notes", value: number | string) => {
    setItems(items.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    ));
  };

  const handleConfirm = async () => {
    setIsLoading(true);

    const result = await confirmReceptionAction({
      receptionId: reception.id,
      items: items.map(i => ({
        itemId: i.itemId,
        receivedQuantity: i.receivedQuantity,
        notes: i.notes || undefined,
      })),
      notes: generalNotes || undefined,
    });

    setIsLoading(false);

    if (result.success) {
      toast.success("Recepción confirmada correctamente");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error || "Error al confirmar la recepción");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl overflow-hidden p-0 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-transparent">
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative flex flex-col h-full max-h-[90vh]">
            {/* Header */}
            <div className="p-8 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                    {isPending && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                    {isPending ? "Recepción Pendiente" : "Recepción Completada"}
                  </div>
                  <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    {isPending ? "Confirmar " : "Detalle "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">Recepción</span>
                  </DialogTitle>
                  <div className="flex items-center gap-4 pt-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      <span className="font-medium">{reception.purchase?.supplier?.name || "Sin proveedor"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="font-medium">{reception.branch?.name}</span>
                    </div>
                    {reception.purchase?.invoiceNumber && (
                      <span className="font-mono">{reception.purchase.invoiceNumber}</span>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-inner">
                  <ClipboardCheck className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
              </div>

              {/* Progress bar */}
              {isPending && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-400">Progreso</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">{totalReceived}/{totalExpected} unidades ({progressPercent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Scanner input */}
            {isPending && (
              <div className="px-8 pt-5 pb-3 space-y-3 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-900/10">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <ScanBarcode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <Input
                      ref={scanRef}
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value)}
                      onKeyDown={handleScanKeyDown}
                      placeholder="Escanear código de barras o SKU..."
                      className="pl-12 h-14 text-lg font-bold bg-white dark:bg-slate-950 border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Items table */}
            <div className="flex-1 overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Producto</th>
                      <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 w-20">Código</th>
                      <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 w-24">Esperado</th>
                      <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 w-28">Recibido</th>
                      <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Obs.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const isComplete = item.receivedQuantity >= item.expectedQuantity;
                      const isDiff = item.receivedQuantity > 0 && item.receivedQuantity !== item.expectedQuantity;
                      const wasJustScanned = item.lastScannedAt && (Date.now() - item.lastScannedAt) < 2000;

                      return (
                        <tr
                          key={item.itemId}
                          className={`border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition-all duration-500 ${
                            wasJustScanned ? "bg-emerald-100/80 dark:bg-emerald-900/30" :
                            isComplete ? "bg-emerald-50/40 dark:bg-emerald-900/10" :
                            isDiff ? "bg-amber-50/50 dark:bg-amber-900/10" :
                            idx % 2 === 1 ? "bg-slate-50/30 dark:bg-slate-900/30" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {isComplete && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                              <span className={`font-medium ${isComplete ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                                {item.productName}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                              {item.productBarcode || item.productSku || "—"}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs">
                              {item.expectedQuantity}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-center">
                            {isPending ? (
                              <Input
                                type="number"
                                min="0"
                                value={item.receivedQuantity}
                                onChange={(e) => updateItem(idx, "receivedQuantity", parseInt(e.target.value) || 0)}
                                className={`h-9 text-center text-sm font-bold rounded-lg w-full ${
                                  isComplete ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-600 dark:text-emerald-400" :
                                  isDiff ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:border-amber-600 dark:text-amber-400" :
                                  "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700"
                                }`}
                              />
                            ) : (
                              <span className={`font-bold px-3 py-1 rounded-lg text-xs ${
                                isDiff ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              }`}>
                                {item.receivedQuantity}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2">
                            {isPending ? (
                              <Input
                                value={item.notes}
                                onChange={(e) => updateItem(idx, "notes", e.target.value)}
                                placeholder={isDiff ? "Motivo..." : ""}
                                className="h-9 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 rounded-lg"
                              />
                            ) : (
                              <span className="text-xs text-slate-400">{item.notes || "—"}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Discrepancy warning */}
              {isPending && hasDiscrepancy && (
                <div className="mx-6 my-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Diferencias detectadas</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Las cantidades recibidas no coinciden con las esperadas. Se impactará solo lo efectivamente recibido.
                    </p>
                  </div>
                </div>
              )}

              {/* General notes */}
              {isPending && (
                <div className="px-6 pb-6 pt-2">
                  <textarea
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder="Notas generales de la recepción..."
                    rows={2}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:outline-none resize-none"
                  />
                </div>
              )}

              {!isPending && reception.notes && (
                <div className="px-6 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Notas</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{reception.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <DialogFooter className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 gap-4 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="px-8 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50"
              >
                {isPending ? "Cancelar" : "Cerrar"}
              </Button>
              {isPending && (
                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading || totalReceived === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 h-14 rounded-2xl shadow-2xl shadow-emerald-200 dark:shadow-none transition-all duration-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-3"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Procesando...</span>
                  ) : (
                    <>
                      Confirmar Recepción ({totalReceived}/{totalExpected})
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
