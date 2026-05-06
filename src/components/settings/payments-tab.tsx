"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, CreditCard, Monitor, CheckCircle2, XCircle, Pencil, Store } from "lucide-react";
import { createPaymentMethodAction, updatePaymentMethodAction, createTerminalAction, updateTerminalAction } from "@/lib/actions/payments";
import { toast } from "sonner";

export function PaymentsTab({ paymentMethods, terminals, branches }: {
  paymentMethods: any[];
  terminals: any[];
  branches: any[];
}) {
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id?.toString() || "");

  if (branches.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
        <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest">Primero debes crear una sucursal</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Tabs value={selectedBranchId} onValueChange={setSelectedBranchId} className="w-full">
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 inline-flex mb-8 shadow-sm overflow-x-auto max-w-full">
          <TabsList className="bg-transparent h-auto gap-1">
            {branches.map((branch) => (
              <TabsTrigger 
                key={branch.id}
                value={branch.id.toString()}
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl px-6 py-2.5 transition-all duration-300 gap-2 font-bold text-xs uppercase tracking-tight"
              >
                <Store className="w-4 h-4" />
                {branch.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {branches.map((branch) => {
          const branchMethods = paymentMethods.filter(pm => pm.branchId === branch.id);
          const branchTerminals = terminals.filter(t => t.branchId === branch.id);
          
          return (
            <TabsContent key={branch.id} value={branch.id.toString()} className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Methods Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                        <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Medios de Pago</h3>
                        <p className="text-xs text-slate-500 font-medium">{branch.name}</p>
                      </div>
                    </div>
                    <PaymentMethodModal branchId={branch.id} />
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {branchMethods.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 italic text-sm font-medium">No hay medios de pago para esta sucursal.</div>
                      ) : (
                        branchMethods.map((pm) => (
                          <div key={pm.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${pm.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                <CreditCard className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{pm.name}</p>
                                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">{pm.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {pm.isActive ? (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                  <CheckCircle2 className="w-3 h-3" /> Activo
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  <XCircle className="w-3 h-3" /> Inactivo
                                </span>
                              )}
                              <PaymentMethodModal method={pm} branchId={branch.id} />
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
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                        <Monitor className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Terminales / Posnets</h3>
                        <p className="text-xs text-slate-500 font-medium">{branch.name}</p>
                      </div>
                    </div>
                    <TerminalModal branchId={branch.id} />
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {branchTerminals.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 italic text-sm font-medium">No hay terminales configuradas para esta sucursal.</div>
                      ) : (
                        branchTerminals.map((t) => (
                          <div key={t.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${t.isActive ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Monitor className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.name}</p>
                                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">ID: {t.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {t.isActive ? (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                  <CheckCircle2 className="w-3 h-3" /> Activo
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  <XCircle className="w-3 h-3" /> Inactivo
                                </span>
                              )}
                              <TerminalModal terminal={t} branchId={branch.id} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function PaymentMethodModal({ method, branchId }: { method?: any, branchId: number }) {
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
      : await createPaymentMethodAction({ name, type, branchId });
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
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-indigo-50">
            <Pencil className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
          </Button>
        ) : (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-11 px-6 font-bold gap-2 shadow-lg shadow-indigo-100 dark:shadow-none transition-all hover:scale-[1.02]">
            <Plus className="w-4 h-4" /> Agregar Medio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-indigo-600 p-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white">{method ? "Editar" : "Nuevo"} Medio de Pago</DialogTitle>
            <p className="text-indigo-100 text-xs font-medium uppercase tracking-widest mt-1">Sucursal ID: {branchId}</p>
          </DialogHeader>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Ej: Efectivo, Débito Visa..." 
              className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Pago</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl">
                <SelectItem value="cash" className="text-xs font-bold uppercase tracking-tight">Efectivo</SelectItem>
                <SelectItem value="card" className="text-xs font-bold uppercase tracking-tight">Tarjeta (Posnet)</SelectItem>
                <SelectItem value="transfer" className="text-xs font-bold uppercase tracking-tight">Transferencia</SelectItem>
                <SelectItem value="digital" className="text-xs font-bold uppercase tracking-tight">Billetera Digital (QR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {method && (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem]">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado Activo</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          )}
        </div>
        <DialogFooter className="p-8 pt-0 gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-2xl h-12 px-8 font-bold text-slate-500">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 h-12 px-10 font-black shadow-xl shadow-indigo-100 dark:shadow-none flex-1">
            {isLoading ? "Guardando..." : "Guardar Medio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TerminalModal({ terminal, branchId }: { terminal?: any, branchId: number }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(terminal?.name || "");
  const [isActive, setIsActive] = useState(terminal?.isActive ?? true);

  const handleSubmit = async () => {
    if (!name) return toast.error("El nombre es obligatorio");
    setIsLoading(true);
    const result = terminal 
      ? await updateTerminalAction(terminal.id, { name, isActive })
      : await createTerminalAction({ name, branchId });
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
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-amber-50">
            <Pencil className="w-4 h-4 text-slate-400 hover:text-amber-600" />
          </Button>
        ) : (
          <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-2xl h-11 px-6 font-bold gap-2 shadow-lg shadow-amber-100 dark:shadow-none transition-all hover:scale-[1.02]">
            <Plus className="w-4 h-4" /> Agregar Terminal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-amber-600 p-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white">{terminal ? "Editar" : "Nueva"} Terminal</DialogTitle>
            <p className="text-amber-100 text-xs font-medium uppercase tracking-widest mt-1">Sucursal ID: {branchId}</p>
          </DialogHeader>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Dispositivo</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Ej: Posnet Lapos 1, QR Mostrador..." 
              className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold"
            />
          </div>
          {terminal && (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem]">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado Activo</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          )}
        </div>
        <DialogFooter className="p-8 pt-0 gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-2xl h-12 px-8 font-bold text-slate-500">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="rounded-2xl bg-amber-600 hover:bg-amber-700 h-12 px-10 font-black shadow-xl shadow-amber-100 dark:shadow-none flex-1">
            {isLoading ? "Guardando..." : "Guardar Terminal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
