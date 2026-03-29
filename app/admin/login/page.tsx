"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) { toast.error("Credenciais inválidas."); setLoading(false); return; }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    if (!profile || profile.role !== "admin") {
      await supabase.auth.signOut();
      toast.error("Acesso não autorizado.");
      setLoading(false);
      return;
    }
    toast.success("Bem-vinda, admin!");
    router.push("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#141414] mb-3">
            <Shield className="h-5 w-5 text-[#C0C0C0]" />
          </div>
          <p className="text-xs text-[#7A7A7A] uppercase tracking-widest">MakeUpMoney Admin</p>
        </div>

        <div className="rounded-[0.5rem] border border-[#2A2A2A] bg-[#141414] p-6">
          <h1 className="text-lg font-display font-medium text-[#F5F5F5] mb-5">Painel Administrativo</h1>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#7A7A7A] uppercase tracking-wide">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="flex h-9 w-full rounded-[0.5rem] border border-[#2A2A2A] bg-[#0A0A0A] px-3 text-sm text-[#F5F5F5] placeholder:text-[#7A7A7A] focus:border-[#C0C0C0] focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#7A7A7A] uppercase tracking-wide">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="flex h-9 w-full rounded-[0.5rem] border border-[#2A2A2A] bg-[#0A0A0A] px-3 text-sm text-[#F5F5F5] placeholder:text-[#7A7A7A] focus:border-[#C0C0C0] focus:outline-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full h-9 bg-[#F5F5F5] text-[#0A0A0A] text-sm font-medium rounded-[0.5rem] hover:bg-[#D4D4D4] transition-colors disabled:opacity-50">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
