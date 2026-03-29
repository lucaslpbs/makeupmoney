"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile, Subscription } from "@/lib/supabase/types";
import { TIPOS_ATUACAO, PLANOS, formatDate } from "@/lib/utils";
import { formatBRL } from "@/lib/calculations";
import { toast } from "sonner";
import { User, CreditCard, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  profile: Profile | null;
  subscription: Subscription | null;
  email: string;
  userId: string;
}

export function PerfilClient({ profile, subscription, email, userId }: Props) {
  const [nome, setNome] = useState(profile?.nome_profissional ?? "");
  const [cidade, setCidade] = useState(profile?.cidade ?? "");
  const [tipo, setTipo] = useState(profile?.tipo_atuacao ?? "");
  const [atend, setAtend] = useState(profile?.atendimentos_mes ?? 20);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({
      nome_profissional: nome,
      cidade,
      tipo_atuacao: tipo,
      atendimentos_mes: atend,
      updated_at: new Date().toISOString(),
    }).eq("id", userId);
    if (error) { toast.error("Erro ao salvar."); setSaving(false); return; }
    toast.success("Perfil atualizado!");
    setSaving(false);
  }

  const plano = subscription?.plano ? PLANOS[subscription.plano as keyof typeof PLANOS] : null;
  const statusColor = subscription?.status === "ativo" ? "active" : "inactive";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-medium text-[var(--foreground)]">Meu Perfil</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Gerencie suas informações e assinatura</p>
      </div>

      {/* Profile form */}
      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-[var(--silver)]" />
          <h2 className="text-sm font-display font-medium text-[var(--foreground)]">Informações profissionais</h2>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">E-mail</label>
            <input value={email} disabled className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--muted)] opacity-60 cursor-not-allowed" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Nome profissional</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Cidade</label>
              <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="São Paulo, SP" className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Tipo de atuação</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none">
                <option value="">Selecionar</option>
                {TIPOS_ATUACAO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Atendimentos / mês</label>
              <input type="number" min="1" value={atend} onChange={(e) => setAtend(Number(e.target.value))} className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
            </div>
          </div>

          <button onClick={save} disabled={saving} className="h-9 px-5 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors disabled:opacity-50 mt-1">
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4 text-[var(--silver)]" />
          <h2 className="text-sm font-display font-medium text-[var(--foreground)]">Assinatura</h2>
        </div>

        {subscription ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-[var(--radius)] border border-[rgba(212,212,212,0.2)] bg-[rgba(212,212,212,0.03)]">
              <div>
                <p className="font-display font-medium text-[var(--foreground)]">{plano?.nome ?? subscription.plano}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {subscription.valor ? formatBRL(Number(subscription.valor)) : "Gratuito"} / {subscription.periodicidade ?? "mês"}
                </p>
              </div>
              <Badge variant={statusColor}>
                {subscription.status === "ativo" ? "Ativo" : subscription.status}
              </Badge>
            </div>

            {subscription.fim && (
              <p className="text-xs text-[var(--muted)]">
                {subscription.status === "ativo" ? "Renova em" : "Expirou em"}: {formatDate(subscription.fim)}
              </p>
            )}

            {plano && (
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-2">Incluído no plano</p>
                <ul className="space-y-1.5">
                  {plano.recursos.map((r, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-[var(--muted)]">
                      <Shield className="h-3 w-3 text-[var(--silver)] shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--muted)] mb-3">Nenhuma assinatura ativa.</p>
            <button className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors">
              Assinar agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
