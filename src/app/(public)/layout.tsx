import { PublicNavbar } from "@/components/public-navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNavbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
    </>
  );
}
