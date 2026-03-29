import { Navbar } from "@/components/Navbar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      {/* Desktop: offset for sidebar; Mobile: offset for top + bottom bars */}
      <main className="lg:pl-56 pt-14 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
