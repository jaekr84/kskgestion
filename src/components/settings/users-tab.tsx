"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Shield, MapPin } from "lucide-react";
import { createUserAction, updateUserAction, deleteUserAction } from "@/lib/actions/users";
import { toast } from "sonner"; // Assuming sonner is used or I'll use a simple alert for now

export function UsersTab({ 
  users, 
  roles, 
  branches 
}: { 
  users: any[]; 
  roles: any[]; 
  branches: any[]; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roleId: "",
    branchIds: [] as number[],
  });

  const resetForm = () => {
    setFormData({ name: "", email: "", roleId: "", branchIds: [] });
    setEditingUser(null);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      roleId: user.roleId?.toString() || "",
      branchIds: user.branchIds || [],
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      roleId: parseInt(formData.roleId),
    };

    const result = editingUser 
      ? await updateUserAction(editingUser.id, data)
      : await createUserAction(data);

    if (result.success) {
      setIsOpen(false);
      resetForm();
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      const result = await deleteUserAction(id);
      if (!result.success) alert(result.error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Usuarios y Personal</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona quién tiene acceso y sus permisos por sucursal.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if(!val) resetForm(); }}>
          <DialogTrigger
            render={
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-300 gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Usuario
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[500px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-slate-200 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {editingUser ? <Pencil className="w-5 h-5 text-indigo-500" /> : <Plus className="w-5 h-5 text-indigo-500" />}
                {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="Ej. Juan Pérez"
                    required
                    className="bg-white/50 dark:bg-slate-800/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    placeholder="juan@empresa.com"
                    required
                    className="bg-white/50 dark:bg-slate-800/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol en la Empresa</Label>
                <Select 
                  value={formData.roleId} 
                  onValueChange={(val) => setFormData({ ...formData, roleId: val })}
                  required
                >
                  <SelectTrigger className="bg-white/50 dark:bg-slate-800/50">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Sucursales Asignadas
                </Label>
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  {branches.map((branch) => (
                    <div key={branch.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`branch-${branch.id}`} 
                        checked={formData.branchIds.includes(branch.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, branchIds: [...formData.branchIds, branch.id] });
                          } else {
                            setFormData({ ...formData, branchIds: formData.branchIds.filter(id => id !== branch.id) });
                          }
                        }}
                      />
                      <label htmlFor={`branch-${branch.id}`} className="text-sm font-medium leading-none cursor-pointer">
                        {branch.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
                  {editingUser ? "Guardar Cambios" : "Crear Usuario"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
            <TableRow>
              <TableHead className="font-bold">Usuario</TableHead>
              <TableHead className="font-bold">Rol</TableHead>
              <TableHead className="font-bold">Sucursales</TableHead>
              <TableHead className="text-right font-bold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  No hay usuarios registrados.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 gap-1.5 py-1 px-3">
                      <Shield className="w-3 h-3" />
                      {user.role?.name || "Sin Rol"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.branchIds?.length > 0 ? (
                        user.branchIds.map((branchId: number) => {
                          const branch = branches.find(b => b.id === branchId);
                          return (
                            <Badge key={branchId} variant="outline" className="text-[10px] font-normal border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400">
                              {branch?.name || "Desconocida"}
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400">Ninguna</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(user)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(user.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
