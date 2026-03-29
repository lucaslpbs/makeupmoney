"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

export default function CadastroPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/app/dashboard`,
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Conta criada! Verifique seu e-mail para confirmar.");
    router.push("/onboarding");
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-display shimmer font-semibold">MakeUpMoney</span>
          </Link>
          <p className="text-xs text-[var(--muted)] mt-1 uppercase tracking-widest">Studio</p>
        </div>

        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h1 className="text-lg font-display font-medium text-[var(--foreground)] mb-1">Criar sua conta</h1>
          <p className="text-sm text-[var(--muted)] mb-6">Comece a precificar com inteligência.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">E-mail</label>
              <input
                type="email"
                placeholder="sua@empresa.com"
                className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-[#fca5a5]">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Senha</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 pr-9 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none"
                  {...register("password")}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[#fca5a5]">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Confirmar senha</label>
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Repita a senha"
                className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="text-xs text-[#fca5a5]">{errors.confirmPassword.message}</p>}
            </div>

            <p className="text-[0.7rem] text-[var(--muted)] leading-relaxed">
              Ao criar conta, você concorda com nossos{" "}
              <Link href="#" className="text-[var(--silver)] hover:text-[var(--foreground)]">Termos de Uso</Link>{" "}
              e{" "}
              <Link href="#" className="text-[var(--silver)] hover:text-[var(--foreground)]">Política de Privacidade</Link>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-[var(--muted)]">
              Já tem conta?{" "}
              <Link href="/login" className="text-[var(--silver)] hover:text-[var(--foreground)] transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--silver)]">
            <ArrowLeft className="h-3 w-3" />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
