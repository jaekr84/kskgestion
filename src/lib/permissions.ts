export type ModuleKey = 
  | "dashboard" 
  | "pos" 
  | "compras" 
  | "recepciones"
  | "inventario" 
  | "configuracion" 
  | "usuarios";

export function hasPermission(permissionsJson: string | null, module: ModuleKey): boolean {
  if (!permissionsJson) return false;
  try {
    const permissions = JSON.parse(permissionsJson) as string[];
    return permissions.includes(module);
  } catch (e) {
    console.error("Error parsing permissions:", e);
    return false;
  }
}
