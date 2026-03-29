"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Client, UserProduct } from "@/lib/supabase/types";
import { formatBRL, calcCustoVariavel } from "@/lib/calculations";
import { formatDate, formatDateFull, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Phone, Mail, Calendar, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";

interface AppointmentProduct { id?: string; product_id: string; quantidade_usada: number; user_products?: UserProduct; }
interface Appointment {
  id: string;
  data_atendimento: string;
  valor_cobrado: number | null;
  custo_total: number | null;
  observacoes: string | null;
  service_types: { nome_servico: string } | null;
  appointment_products: AppointmentProduct[];
}
interface ServiceType { id: string; nome_servico: string; }

interface Props {
  client: Client;
  appointments: Appointment[];
  products: UserProduct[];
  services: ServiceType[];
  userId: string;
}

export function ClientePerfilClient({ client, appointments: initial, products, services, userId }: Props) {
  const [appointments, setAppointments] = useState(initial);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [serviceId, setServiceId] = useState("");
  const [valorCobrado, setValorCobrado] = useState("");
  const [obs, setObs] = useState("");
  const [lines, setLines] = useState<{ product_id: string; quantidade: number }[]>([{ product_id: "", quantidade: 1 }]);

  function openModal() {
    setDate(new Date().toISOString().slice(0, 10));
    setServiceId(""); setValorCobrado(""); setObs("");
    setLines([{ product_id: "", quantidade: 1 }]);
    setModal(true);
  }

  function addLine() { setLines((p) => [...p, { product_id: "", quantidade: 1 }]); }
  function updateLine(idx: number, f: string, v: string | number) { setLines((p) => p.map((x, i) => i === idx ? { ...x, [f]: v } : x)); }
  function removeLine(idx: number) { setLines((p) => p.filter((_, i) => i !== idx)); }

  const custoCalculado = calcCustoVariavel(
    lines.filter((l) => l.product_id && l.quantidade > 0).map((l) => {
      const prod = products.find((p) => p.id === l.product_id);
      return prod ? { custo_por_uso: Number(prod.custo_por_uso), quantidade_usada: l.quantidade } : null;
    }).filter(Boolean) as { custo_por_uso: number; quantidade_usada: number }[]
  );

  async function saveAppointment() {
    if (!date) { toast.error("Informe a data do atendimento."); return; }
    setLoading(true);
    const supabase = createClient();

    const { data: newAppt, error } = await supabase.from("client_appointments").insert({
      client_id: client.id,
      user_id: userId,
      service_type_id: serviceId || null,
      data_atendimento: date,
      valor_cobrado: valorCobrado ? Number(valorCobrado) : null,
      custo_total: custoCalculado || null,
      observacoes: obs || null,
    }).select("*, service_types(nome_servico), appointment_products(*, user_products(*))").single();

    if (error || !newAppt) { toast.error("Erro ao salvar atendimento."); setLoading(false); return; }

    const validLines = lines.filter((l) => l.product_id && l.quantidade > 0);
    if (validLines.length > 0) {
      const prodMap = Object.fromEntries(products.map((p) => [p.id, Number(p.custo_por_uso)]));
      await supabase.from("appointment_products").insert(validLines.map((l) => ({
        appointment_id: newAppt.id,
        product_id: l.product_id,
        quantidade_usada: l.quantidade,
        custo_calculado: (prodMap[l.product_id] ?? 0) * l.quantidade,
      })));
    }

    setAppointments((prev) => [newAppt as unknown as Appointment, ...prev]);
    toast.success("Atendimento registrado!");
    setModal(false);
    setLoading(false);
  }

  async function deleteAppt(id: string) {
    if (!confirm("Excluir este atendimento?")) return;
    const supabase = createClient();
    await supabase.from("appointment_products").delete().eq("appointment_id", id);
    await supabase.from("client_appointments").delete().eq("id", id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    toast.success("Atendimento removido.");
  }

  const totalGasto = appointments.reduce((sum, a) => sum + Number(a.valor_cobrado ?? 0), 0);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <Link href="/app/clientes" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar para clientes
      </Link>

      {/* Profile header */}
      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full border border-[var(--border)] flex items-center justify-center text-lg font-medium text-[var(--silver)] bg-[var(--background)] shrink-0">
            {getInitials(client.nome)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-display font-medium text-[var(--foreground)]">{client.nome}</h1>
            <div className="flex flex-wrap gap-4 mt-2">
              {client.telefone && (
                <div className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
                  <Phone className="h-3.5 w-3.5" />
                  {client.telefone}
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
                  <Mail className="h-3.5 w-3.5" />
                  {client.email}
                </div>
              )}
              {client.data_nascimento && (
                <div className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(client.data_nascimento)}
                </div>
              )}
            </div>
            {client.observacoes && (
              <p className="mt-2 text-sm text-[var(--muted)] border-t border-[var(--border)] pt-2">{client.observacoes}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Total gasto</p>
            <p className="text-xl font-medium text-[var(--silver)] shimmer mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {formatBRL(totalGasto)}
            </p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{appointments.length} atendimento{appointments.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {/* Appointments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-display font-medium text-[var(--foreground)]">Histórico de atendimentos</h2>
          <button onClick={openModal} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--foreground)] text-[var(--background)] text-xs font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors">
            <Plus className="h-3.5 w-3.5" />
            Novo atendimento
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <Calendar className="h-8 w-8 text-[var(--muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--muted)]">Nenhum atendimento registrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div key={a.id} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {a.service_types?.nome_servico ?? "Atendimento avulso"}
                      </p>
                      <span className="text-xs text-[var(--muted)]">·</span>
                      <span className="text-xs text-[var(--muted)]">{formatDateFull(a.data_atendimento)}</span>
                    </div>
                    {a.observacoes && (
                      <p className="text-xs text-[var(--muted)] mt-1">{a.observacoes}</p>
                    )}
                    {a.appointment_products.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {a.appointment_products.filter(p => p.user_products).map((p, i) => (
                          <span key={i} className="badge badge-silver text-[0.65rem]">
                            {p.user_products!.nome} × {p.quantidade_usada} {p.user_products!.unidade}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      {a.valor_cobrado && (
                        <>
                          <p className="text-sm font-medium text-[var(--silver)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {formatBRL(Number(a.valor_cobrado))}
                          </p>
                          {a.custo_total && (
                            <p className="text-xs text-[var(--muted)]">custo: {formatBRL(Number(a.custo_total))}</p>
                          )}
                        </>
                      )}
                    </div>
                    <button onClick={() => deleteAppt(a.id)} className="p-1.5 text-[var(--muted)] hover:text-[#fca5a5] hover:bg-[var(--background)] rounded transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-display font-medium text-[var(--foreground)]">Registrar atendimento</h2>
              <button onClick={() => setModal(false)}><X className="h-5 w-5 text-[var(--muted)]" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Data *</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Tipo de serviço</label>
                  <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none">
                    <option value="">Avulso</option>
                    {services.map((s) => <option key={s.id} value={s.id}>{s.nome_servico}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Produtos usados</label>
                  <button onClick={addLine} className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--silver)]">
                    <Plus className="h-3 w-3" />
                    Adicionar
                  </button>
                </div>
                {lines.map((line, idx) => {
                  const prod = products.find((p) => p.id === line.product_id);
                  return (
                    <div key={idx} className="flex gap-2 items-center">
                      <select value={line.product_id} onChange={(e) => updateLine(idx, "product_id", e.target.value)} className="flex-1 h-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-2 text-xs text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none">
                        <option value="">Selecionar produto</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                      </select>
                      <input type="number" min="0" step="0.001" value={line.quantidade} onChange={(e) => updateLine(idx, "quantidade", Number(e.target.value))} className="w-16 h-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-2 text-xs text-[var(--foreground)] focus:border-[var(--silver)] focus:outline-none" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                      <span className="text-xs text-[var(--muted)] w-4">{prod?.unidade}</span>
                      <button onClick={() => removeLine(idx)} className="text-[var(--muted)] hover:text-[#fca5a5]"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  );
                })}
                {custoCalculado > 0 && (
                  <p className="text-xs text-[var(--muted)]">
                    Custo estimado: <span className="text-[var(--silver)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatBRL(custoCalculado)}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Valor cobrado (R$)</label>
                <input type="number" min="0" step="0.01" value={valorCobrado} onChange={(e) => setValorCobrado(e.target.value)} placeholder="250.00" className="flex h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Observações</label>
                <textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Notas sobre o atendimento..." rows={2} className="flex w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--silver)] focus:outline-none resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(false)} className="flex-1 h-9 border border-[var(--border)] text-sm text-[var(--muted)] rounded-[var(--radius)] hover:border-[var(--border-light)] hover:text-[var(--foreground)] transition-all">Cancelar</button>
                <button onClick={saveAppointment} disabled={loading} className="flex-1 h-9 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-[var(--radius)] hover:bg-[var(--accent)] transition-colors disabled:opacity-50">
                  {loading ? "Salvando..." : "Registrar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
