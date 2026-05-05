import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTab } from "@/components/settings/users-tab";
import { GeneralTab } from "@/components/settings/general-tab";
import { BranchesTab } from "@/components/settings/branches-tab";
import { getTenantData } from "@/lib/actions/users";
import { getTenant } from "@/lib/actions/tenants";
import { getPaymentMethodsAction, getTerminalsAction } from "@/lib/actions/payments";
import { Users, Building2, ShieldCheck, Settings2, CreditCard } from "lucide-react";
import { PaymentsTab } from "@/components/settings/payments-tab";

export default async function SettingsPage() {
  const [{ users, roles, branches }, tenant, paymentMethods, terminals] = await Promise.all([
    getTenantData(),
    getTenant(),
    getPaymentMethodsAction(),
    getTerminalsAction(),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Configuración
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Administra tu empresa, sucursales y equipo de trabajo.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 inline-flex mb-8 shadow-sm">
          <TabsList className="bg-transparent gap-1">
            <TabsTrigger 
              value="general" 
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl px-6 py-2.5 transition-all duration-300 gap-2"
            >
              <Settings2 className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl px-6 py-2.5 transition-all duration-300 gap-2"
            >
              <Users className="w-4 h-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger 
              value="branches" 
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl px-6 py-2.5 transition-all duration-300 gap-2"
            >
              <Building2 className="w-4 h-4" />
              Sucursales
            </TabsTrigger>
            <TabsTrigger 
              value="roles" 
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl px-6 py-2.5 transition-all duration-300 gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl px-6 py-2.5 transition-all duration-300 gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Pagos
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general">
          <GeneralTab tenant={tenant} />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab users={users} roles={roles} branches={branches} />
        </TabsContent>

        <TabsContent value="branches">
          <BranchesTab branches={branches} />
        </TabsContent>

        <TabsContent value="roles">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold mb-4">Roles y Permisos</h3>
            <p className="text-slate-500">Próximamente: Personaliza qué módulos puede ver cada rol.</p>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <PaymentsTab 
            paymentMethods={paymentMethods} 
            terminals={terminals} 
            branches={branches} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
