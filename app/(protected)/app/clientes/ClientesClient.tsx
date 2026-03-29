"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatBRL } from "@/lib/calculations";
import { formatDate, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Users, Search, Phone, Mail, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  nome: z.string().min(1, "Obrigatório"),
  telefone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  data_nascimento: z.string().optional(),
  observacoes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface ClientWithAppointments {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  data_nascimento: string | null;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
  client_appointments: Array<{ id: string; data_atendimento: string; valor_cobrado: number | null }>;
}

interface Props { clients: ClientWithAppointments[]; userId: string; }

export function ClientesClient({ clients: initial, userId }: Props) {
  const router = useRouter();
  const [clients, setClients] = useState(initial);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<ClientWithAppointments | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  function openCreate() {
    setEditing(null);
    reset({ nome: "", telefone: "", email: "", data_nascimento: "", observacoes: "" });
    setModal(true);
  }

  function openEdit(c: ClientWithAppointments) {
    setEditing(c);
    reset({
      nome: c.nome,
      telefone: c.telefone ?? "",
      email: c.email ?? "",
      data_nascimento: c.data_nascimento ?? "",
      observacoes: c.observacoes ?? "",
    });
    setModal(true);
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    const supabase = createClient();
    const payload = {
      nome: data.nome,
      telefone: data.telefone || null,
      email: data.email || null,
      data_nascimento: data.data_nascimento || null,
      observacoes: data.observacoes || null,
    };

    if (editing) {
      const { error } = await supabase.from("clients").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editing.id);
      if (error) { toast.error("Erro ao atualizar."); setLoading(false); return; }
      setClients((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...payload } : c));
      toast.success("Cliente atualizado!");
    } else {
      const { data: inserted, error } = await supabase.from("clients").insert({ ...payload, user_id: userId }).select("*, client_appointments(id, data_atendimento, valor_cobrado)").single();
      if (error || !inserted) { toast.error("Erro ao cadastrar."); setLoading(false); return; }
      setClients((prev) => [...prev, inserted]);
      toast.success("Cliente cadastrada!");
    }
    setModal(false);
    setLoading(false);
  }

  const filtered = clients.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.telefone?.includes(search)
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-medium text-[var(--foreground)]">Clientes</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">{clients.length} cliente{clients.length !== 1 ? "s" : ""} na base</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors">
          <Plus className="h-4 w-4" />
          Nova cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
        <input
          type="text"
          placeholder="Buscar por nome, e-mail ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <Users className="h-10 w-10 text-[var(--muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--muted)] mb-3">
            {search ? "Nenhum resultado para sua busca." : "Nenhuma cliente cadastrada ainda."}
          </p>
          {!search && (
            <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)]">
              <Plus className="h-4 w-4" />
              Cadastrar primeira cliente
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((c) => {
            const lastAppt = c.client_appointments.sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime())[0];
            const totalGasto = c.client_appointments.reduce((sum, a) => sum + Number(a.valor_cobrado ?? 0), 0);
            return (
              <Link
                key={c.id}
                href={`/app/clientes/${c.id}`}
                className="block rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--border-light)] hover:bg-[var(--surface-hover)] transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-[var(--border)] border border-[var(--border)] flex items-center justify-center text-xs font-medium text-[var(--silver)] shrink-0">
                    {getInitials(c.nome)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-[var(--foreground)] truncate">{c.nome}</p>
                      <ChevronRight className="h-4 w-4 text-[var(--muted)] group-hover:text-[var(--silver)] transition-colors shrink-0" />
                    </div>
                    {c.telefone && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-[var(--muted)]" />
                        <span className="text-xs text-[var(--muted)]">{c.telefone}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-[var(--muted)]" />
                        <span className="text-xs text-[var(--muted)] truncate">{c.email}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border)]">
                      <span className="text-xs text-[var(--muted)]">
                        {c.client_appointments.length} atendimento{c.client_appointments.length !== 1 ? "s" : ""}
                        {lastAppt && ` · último ${formatDate(lastAppt.data_atendimento)}`}
                      </span>
                      {totalGasto > 0 && (
                        <span className="text-xs text-[var(--silver)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {formatBRL(totalGasto)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-display font-medium text-[var(--foreground)]">
                {editing ? "Editar cliente" : "Nova cliente"}
              </h2>
              <button onClick={() => setModal(false)}><X className="h-5 w-5 text-[var(--muted)]" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {[
                { name: "nome", label: "Nome *", placeholder: "Maria Silva", type: "text" },
                { name: "telefone", label: "Telefone", placeholder: "(11) 99999-9999", type: "tel" },
                { name: "email", label: "E-mail", placeholder: "maria@email.com", type: "email" },
                { name: "data_nascimento", label: "Data de nascimento", placeholder: "", type: "date" },
              ].map((f) => (
                <div key={f.name} className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    {...register(f.name as keyof FormData)}
                    className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none"
                  />
                  {errors[f.name as keyof FormData] && (
                    <p className="text-xs text-[#fca5a5]">{errors[f.name as keyof FormData]?.message as string}</p>
                  )}
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Observações / alergias</label>
                <textarea
                  {...register("observacoes")}
                  placeholder="Alergias, preferências, observações importantes..."
                  rows={3}
                  className="flex w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 h-9 border border-[var(--border)] text-sm text-[var(--muted)] rounded-[var(--radius)] hover:border-[var(--border-light)] hover:text-[var(--foreground)] transition-all">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 h-9 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors disabled:opacity-50">
                  {loading ? "Salvando..." : editing ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
