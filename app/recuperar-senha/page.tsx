"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle } from "lucide-react";

const schema = z.object({ email: z.string().email("E-mail inválido") });
type FormData = z.infer<typeof schema>;

export default function RecuperarSenhaPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/app/perfil`,
    });
    if (error) {
      toast.error("Erro ao enviar e-mail. Tente novamente.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-3xl font-display shimmer font-semibold">MakeUpMoney</span>
          <p className="text-xs text-[var(--muted)] mt-1 uppercase tracking-widest">Studio</p>
        </div>

        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="h-10 w-10 text-[#86efac] mx-auto mb-3" />
              <h2 className="text-lg font-display font-medium text-[var(--foreground)] mb-2">E-mail enviado!</h2>
              <p className="text-sm text-[var(--muted)]">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 mt-4 text-sm text-[var(--silver)] hover:text-[var(--foreground)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-display font-medium text-[var(--foreground)] mb-1">Recuperar senha</h1>
              <p className="text-sm text-[var(--muted)] mb-6">Enviaremos um link para redefinir sua senha.</p>
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-9 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Enviar link"}
                </button>
              </form>
              <div className="mt-4 text-center">
                <Link href="/login" className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--silver)]">
                  <ArrowLeft className="h-3 w-3" />
                  Voltar para o login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
