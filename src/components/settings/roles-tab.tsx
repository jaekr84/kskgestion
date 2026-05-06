"use client";

import { useState } from "react";
import { 
  Plus, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  Pencil, 
  CheckCircle2, 
  XCircle,
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  ClipboardCheck,
  Package,
  Settings,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ModuleKey } from "@/lib/permissions";
import { createRoleAction, updateRoleAction, assignUserRoleAction } from "@/lib/actions/roles";

const MODULES: { key: ModuleKey; label: string; icon: any }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "pos", label: "Punto de Venta (POS)", icon: ShoppingCart },
  { key: "compras", label: "Compras / Proveedores", icon: CreditCard },
  { key: "recepciones", label: "Recepciones de Stock", icon: ClipboardCheck },
  { key: "inventario", label: "Control de Inventario", icon: Package },
  { key: "configuracion", label: "Ajustes del Sistema", icon: Settings },
  { key: "usuarios", label: "Gestión de Usuarios", icon: UserCircle },
];

export function RolesTab({ initialRoles, initialUsers }: { initialRoles: any[]; initialUsers: any[] }) {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<ModuleKey[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenRoleModal = (role?: any) => {
    if (role) {
      setEditingRole(role);
      setRoleName(role.name);
      setRoleDescription(role.description || "");
      setSelectedPermissions(JSON.parse(role.permissions));
    } else {
      setEditingRole(null);
      setRoleName("");
      setRoleDescription("");
      setSelectedPermissions([]);
    }
    setIsRoleModalOpen(true);
  };

  const handleTogglePermission = (module: ModuleKey) => {
    setSelectedPermissions(prev => 
      prev.includes(module) 
        ? prev.filter(m => m !== module) 
        : [...prev, module]
    );
  };

  const handleSaveRole = async () => {
    if (!roleName) {
      toast.error("El nombre del rol es obligatorio");
      return;
    }
    setIsSaving(true);
    const result = editingRole 
      ? await updateRoleAction(editingRole.id, { name: roleName, description: roleDescription, permissions: selectedPermissions })
      : await createRoleAction({ name: roleName, description: roleDescription, permissions: selectedPermissions });

    if (result.success) {
      toast.success(editingRole ? "Rol actualizado" : "Rol creado");
      setIsRoleModalOpen(false);
    } else {
      toast.error(result.error);
    }
    setIsSaving(false);
  };

  const handleAssignRole = async (userId: number, roleId: string) => {
    const rid = roleId === "none" ? null : parseInt(roleId);
    const result = await assignUserRoleAction(userId, rid);
    if (result.success) {
      toast.success("Rol asignado con éxito");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Roles Management Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Estructura de Roles</h2>
              <p className="text-xs text-slate-500 font-medium">Define qué módulos puede ver y operar cada nivel de usuario.</p>
            </div>
          </div>
          <Button 
            onClick={() => handleOpenRoleModal()}
            className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 h-12 px-6 font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Rol
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialRoles.map((role) => (
            <div 
              key={role.id} 
              className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600"
                  onClick={() => handleOpenRoleModal(role)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{role.name}</h3>
              <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">{role.description || "Sin descripción"}</p>
              
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Permisos Activos</p>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(role.permissions).length === 0 ? (
                    <span className="text-[10px] font-bold text-slate-400 italic">Sin permisos asignados</span>
                  ) : (
                    JSON.parse(role.permissions).map((pk: string) => {
                      const mod = MODULES.find(m => m.key === pk);
                      return (
                        <div key={pk} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
                          {mod && <mod.icon className="w-3 h-3 text-indigo-500" />}
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                            {mod?.label || pk}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ))}
          {initialRoles.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <ShieldAlert className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest opacity-50">No hay roles definidos</p>
            </div>
          )}
        </div>
      </section>

      {/* User Assignment Section */}
      <section className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Asignación de Usuarios</h2>
            <p className="text-xs text-slate-500 font-medium">Vincula a tu personal con los roles definidos arriba.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="text-left px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Usuario</th>
                <th className="text-left px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Email</th>
                <th className="text-left px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-[300px]">Rol Asignado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {initialUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-indigo-600 uppercase">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-slate-500 font-medium">{user.email}</td>
                  <td className="px-8 py-4">
                    <Select 
                      defaultValue={user.roleId?.toString() || "none"}
                      onValueChange={(val) => handleAssignRole(user.id, val)}
                    >
                      <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs uppercase tracking-tight shadow-sm">
                        <SelectValue placeholder="Sin Rol" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value="none" className="text-xs font-bold uppercase tracking-tight">Sin Rol</SelectItem>
                        {initialRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()} className="text-xs font-bold uppercase tracking-tight">
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Role Creation/Editing Modal */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-h-[95vh] flex flex-col">
          <div className="bg-indigo-600 p-8 text-white shrink-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white">
                {editingRole ? "Editar Rol" : "Nuevo Rol de Usuario"}
              </DialogTitle>
              <p className="text-indigo-100 text-sm font-medium">Configura el nombre y los permisos del rol.</p>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Rol</label>
                <Input 
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Ej: Vendedor Senior, Supervisor..."
                  className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción</label>
                <Input 
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Explica qué funciones cumple este rol..."
                  className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-medium text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Permisos por Módulo</h3>
              <div className="grid grid-cols-1 gap-3">
                {MODULES.map((mod) => (
                  <div 
                    key={mod.key} 
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent hover:border-indigo-100 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                        <mod.icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{mod.label}</span>
                    </div>
                    <Switch 
                      checked={selectedPermissions.includes(mod.key)}
                      onCheckedChange={() => handleTogglePermission(mod.key)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setIsRoleModalOpen(false)}
              className="rounded-2xl h-12 px-8 font-bold text-slate-500"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveRole}
              disabled={isSaving}
              className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 h-12 px-10 font-black shadow-xl shadow-indigo-100 dark:shadow-none"
            >
              {isSaving ? "Guardando..." : "Guardar Rol"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
