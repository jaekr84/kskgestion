import { BottomNavbar } from "@/components/bottom-navbar";
import { getPendingReceptionCountAction } from "@/lib/actions/receptions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { total: pendingReceptions } = await getPendingReceptionCountAction();

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      <main className="flex-1 flex flex-col pb-40">
        <div className="flex-1 p-6 w-full">
          {children}
        </div>
      </main>
      
      <footer className="fixed bottom-0 w-full py-2 px-6 flex justify-center items-center bg-transparent pointer-events-none">
        <p className="text-[10px] text-slate-400 pointer-events-auto">
          Developed and designed by{" "}
          <a 
            href="https://x.com/Kr84Jae" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            JaeKr84
          </a>
        </p>
      </footer>

      <BottomNavbar pendingReceptions={pendingReceptions} />
    </div>
  );
}
