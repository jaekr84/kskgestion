"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, CreditCard, Monitor, CheckCircle2, XCircle, Pencil } from "lucide-react";
import { createPaymentMethodAction, updatePaymentMethodAction, createTerminalAction, updateTerminalAction } from "@/lib/actions/payments";
import { toast } from "sonner";

export function PaymentsTab({ paymentMethods, terminals, branches }: {
  paymentMethods: any[];
  terminals: any[];
  branches: any[];
}) {
  const [isLpm, setIsLpm] = useState(false);
  const [isLt, setIsLt] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Payment Methods Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Medios de Pago
            </h3>
            <p className="text-sm text-slate-500">Define cómo pueden pagar tus clientes.</p>
          </div>
          <PaymentMethodModal />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {paymentMethods.length === 0 ? (
              <div className="p-8 text-center text-slate-500 italic">No hay medios de pago configurados.</div>
            ) : (
              paymentMethods.map((pm) => (
                <div key={pm.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${pm.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{pm.name}</p>
                      <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">{pm.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {pm.isActive ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> Activo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <XCircle className="w-3 h-3" /> Inactivo
                      </span>
                    )}
                    <PaymentMethodModal method={pm} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Terminals Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Monitor className="w-5 h-5 text-indigo-600" />
              Terminales / Posnets
            </h3>
            <p className="text-sm text-slate-500">Registra tus dispositivos de cobro.</p>
          </div>
          <TerminalModal branches={branches} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {terminals.length === 0 ? (
              <div className="p-8 text-center text-slate-500 italic">No hay terminales configuradas.</div>
            ) : (
              terminals.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${t.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{t.name}</p>
                      <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">{t.branch?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {t.isActive ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> Activo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <XCircle className="w-3 h-3" /> Inactivo
                      </span>
                    )}
                    <TerminalModal terminal={t} branches={branches} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodModal({ method }: { method?: any }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(method?.name || "");
  const [type, setType] = useState(method?.type || "cash");
  const [isActive, setIsActive] = useState(method?.isActive ?? true);

  const handleSubmit = async () => {
    if (!name) return toast.error("El nombre es obligatorio");
    setIsLoading(true);
    const result = method 
      ? await updatePaymentMethodAction(method.id, { name, type, isActive })
      : await createPaymentMethodAction({ name, type });
    setIsLoading(false);
    if (result.success) {
      toast.success(method ? "Actualizado" : "Creado");
      setOpen(false);
      if (!method) setName("");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {method ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
            <Pencil className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-lg shadow-indigo-100">
            <Plus className="w-4 h-4" /> Agregar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>{method ? "Editar" : "Nuevo"} Medio de Pago</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Efectivo, Débito Visa..." />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="digital">Billetera Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {method && (
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <Label>Estado Activo</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-indigo-600 text-white px-8">
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TerminalModal({ terminal, branches }: { terminal?: any, branches: any[] }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(terminal?.name || "");
  const [branchId, setBranchId] = useState(terminal?.branchId?.toString() || branches[0]?.id?.toString() || "");
  const [isActive, setIsActive] = useState(terminal?.isActive ?? true);

  const handleSubmit = async () => {
    if (!name || !branchId) return toast.error("Completa todos los campos");
    setIsLoading(true);
    const result = terminal 
      ? await updateTerminalAction(terminal.id, { name, isActive })
      : await createTerminalAction({ name, branchId: parseInt(branchId) });
    setIsLoading(false);
    if (result.success) {
      toast.success(terminal ? "Actualizada" : "Creada");
      setOpen(false);
      if (!terminal) setName("");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {terminal ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
            <Pencil className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-lg shadow-indigo-100">
            <Plus className="w-4 h-4" /> Agregar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>{terminal ? "Editar" : "Nueva"} Terminal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nombre del Dispositivo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Posnet Lapos 1, QR Mostrador..." />
          </div>
          {!terminal && (
            <div className="space-y-2">
              <Label>Sucursal Asignada</Label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(b => (
                    <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {terminal && (
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <Label>Estado Activo</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-indigo-600 text-white px-8">
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
