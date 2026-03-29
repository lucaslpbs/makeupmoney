"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  Scissors,
  Calculator,
  Target,
  Users,
  History,
  User,
  BookOpen,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/produtos", label: "Produtos", icon: Package },
  { href: "/app/custos-fixos", label: "Custos Fixos", icon: DollarSign },
  { href: "/app/servicos", label: "Serviços", icon: Scissors },
  { href: "/app/calculadora", label: "Calculadora", icon: Calculator },
  { href: "/app/metas", label: "Metas", icon: Target },
  { href: "/app/clientes", label: "Clientes", icon: Users },
  { href: "/app/historico", label: "Histórico", icon: History },
  { href: "/app/biblioteca", label: "Biblioteca MakeUpMoney", icon: BookOpen },
];

const bottomItems = [
  { href: "/app/perfil", label: "Perfil", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Até logo!");
    router.push("/login");
  }

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-sm transition-all duration-150",
          active
            ? "bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)]"
            : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
        )}
      >
        <item.icon className={cn("h-4 w-4 shrink-0", active && "text-[var(--silver)]")} />
        <span>{item.label}</span>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[var(--border)]">
        <Link href="/app/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-display shimmer font-semibold">MakeUpMoney</span>
          <span className="text-[0.65rem] text-[var(--muted)] uppercase tracking-widest mt-1">Studio</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-[var(--border)] space-y-0.5">
        {bottomItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-sm text-[var(--muted)] hover:text-[#fca5a5] hover:bg-[rgba(127,29,29,0.2)] transition-all duration-150"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-[var(--border)] bg-[var(--background)] fixed left-0 top-0 h-full z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b border-[var(--border)] bg-[var(--background)]">
        <Link href="/app/dashboard">
          <span className="text-lg font-display shimmer font-semibold">MakeUpMoney</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-[var(--radius)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[var(--background)] border-r border-[var(--border)] animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--border)] bg-[var(--background)] h-16 px-2">
        {[navItems[0], navItems[3], navItems[4], navItems[5], navItems[6]].map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 rounded-[var(--radius)] transition-all",
                active ? "text-[var(--foreground)]" : "text-[var(--muted)]"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "text-[var(--silver)]")} />
              <span className="text-[0.6rem] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
