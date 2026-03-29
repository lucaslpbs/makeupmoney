import Link from "next/link";
import { Check, ArrowRight, Calculator, TrendingUp, Users, Shield } from "lucide-react";
import { PLANOS } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 border-b border-[#2A2A2A] bg-[rgba(10,10,10,0.9)] backdrop-blur-sm">
        <span className="text-xl font-display shimmer font-semibold tracking-wide">MakeUpMoney</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-[#7A7A7A] hover:text-[#F5F5F5] transition-colors hidden sm:block">
            Entrar
          </Link>
          <Link href="/cadastro" className="px-4 py-2 bg-[#F5F5F5] text-[#0A0A0A] text-sm font-medium rounded-[0.5rem] hover:bg-[#D4D4D4] transition-colors">
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 md:px-12 text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,212,212,0.04)_0%,transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(212,212,212,0.2)] bg-[rgba(212,212,212,0.05)] text-xs text-[#C0C0C0] mb-8 uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-[#86efac]" />
            Plataforma exclusiva para maquiadoras
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-medium leading-[1.1] mb-6">
            Pare de cobrar no{" "}
            <span className="shimmer">achismo.</span>
          </h1>

          <p className="text-lg md:text-xl text-[#7A7A7A] max-w-2xl mx-auto mb-10 leading-relaxed">
            O MakeUpMoney calcula o custo real de cada atendimento, define o preço justo para o seu trabalho
            e te ajuda a atingir suas metas financeiras com precisão.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#F5F5F5] text-[#0A0A0A] font-medium rounded-[0.5rem] hover:bg-[#D4D4D4] transition-colors text-sm"
            >
              Criar conta gratuita
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 border border-[#2A2A2A] text-[#F5F5F5] font-medium rounded-[0.5rem] hover:border-[#C0C0C0] transition-colors text-sm"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 md:px-12 border-t border-[#2A2A2A]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-4xl font-display font-medium mb-4">
              Tudo que você precisa para precificar com confiança
            </h2>
            <p className="text-[#7A7A7A] max-w-xl mx-auto">
              Desenvolvido especialmente para maquiadoras profissionais que querem crescer com números reais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Calculator,
                title: "Calculadora de precificação",
                description: "Calcule o custo real de cada atendimento incluindo produtos, custos fixos, deslocamento e margem de lucro.",
              },
              {
                icon: TrendingUp,
                title: "Metas financeiras",
                description: "Defina sua meta mensal e saiba exatamente quantos atendimentos você precisa fazer para atingi-la.",
              },
              {
                icon: Users,
                title: "Gestão de clientes",
                description: "Mantenha o histórico completo de cada cliente com atendimentos, produtos usados e valor cobrado.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-[0.5rem] border border-[#2A2A2A] bg-[#141414] p-6 hover:border-[#333333] transition-colors">
                <div className="h-9 w-9 rounded-[0.5rem] border border-[#2A2A2A] bg-[#0A0A0A] flex items-center justify-center mb-4">
                  <f.icon className="h-4 w-4 text-[#C0C0C0]" />
                </div>
                <h3 className="text-base font-display font-medium text-[#F5F5F5] mb-2">{f.title}</h3>
                <p className="text-sm text-[#7A7A7A] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 md:px-12 border-t border-[#2A2A2A] bg-[#0D0D0D]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-4xl font-display font-medium mb-4">Como funciona</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Cadastre seus produtos",
                description: "Adicione cada insumo com o valor pago e o rendimento estimado. O MakeUpMoney calcula automaticamente o custo por uso.",
              },
              {
                step: "02",
                title: "Configure seus custos fixos",
                description: "Aluguel, energia, internet, marketing — registre tudo para ter o real custo operacional do seu negócio.",
              },
              {
                step: "03",
                title: "Simule e precifique",
                description: "Selecione os produtos usados em cada tipo de serviço e descubra o preço mínimo e o preço ideal em segundos.",
              },
              {
                step: "04",
                title: "Acompanhe suas metas",
                description: "Defina o quanto quer ganhar por mês e saiba exatamente qual ticket e quantos atendimentos você precisa.",
              },
            ].map((s, i) => (
              <div key={s.step} className="flex gap-5 p-5 rounded-[0.5rem] border border-[#2A2A2A] bg-[#141414] items-start">
                <span className="text-2xl font-display font-medium text-[#333333] shrink-0 w-8">{s.step}</span>
                <div>
                  <h3 className="text-base font-medium text-[#F5F5F5] mb-1">{s.title}</h3>
                  <p className="text-sm text-[#7A7A7A] leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 md:px-12 border-t border-[#2A2A2A]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-4xl font-display font-medium mb-4">Planos</h2>
            <p className="text-[#7A7A7A]">Comece grátis por 30 dias. Cancele quando quiser.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(PLANOS).map(([key, plano], i) => (
              <div
                key={key}
                className={`rounded-[0.5rem] border p-6 flex flex-col ${
                  i === 1
                    ? "border-[rgba(212,212,212,0.3)] bg-[rgba(212,212,212,0.03)]"
                    : "border-[#2A2A2A] bg-[#141414]"
                }`}
              >
                {i === 1 && (
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full border border-[rgba(212,212,212,0.3)] bg-[rgba(212,212,212,0.08)] text-[0.65rem] text-[#C0C0C0] uppercase tracking-widest mb-3 self-start">
                    Popular
                  </div>
                )}
                <h3 className="text-lg font-display font-medium text-[#F5F5F5] mb-1">{plano.nome}</h3>
                <p className="text-xs text-[#7A7A7A] mb-4">{plano.descricao}</p>
                <div className="mb-6">
                  <span className="text-3xl font-medium text-[#F5F5F5]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    R$ {plano.valor.toFixed(0)}
                  </span>
                  <span className="text-sm text-[#7A7A7A]">/mês</span>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plano.recursos.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-[#C0C0C0]">
                      <Check className="h-4 w-4 text-[#86efac] shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cadastro"
                  className={`w-full flex items-center justify-center py-2.5 rounded-[0.5rem] text-sm font-medium transition-colors ${
                    i === 1
                      ? "bg-[#F5F5F5] text-[#0A0A0A] hover:bg-[#D4D4D4]"
                      : "border border-[#2A2A2A] text-[#F5F5F5] hover:border-[#C0C0C0]"
                  }`}
                >
                  Começar grátis
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-12 border-t border-[#2A2A2A] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-display font-medium mb-4">
            Seu trabalho tem valor.<br />
            <span className="shimmer">Cobre o que você merece.</span>
          </h2>
          <p className="text-[#7A7A7A] mb-8">
            Junte-se a maquiadoras que já precificam com consciência e alcançam suas metas financeiras.
          </p>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5F5F5] text-[#0A0A0A] font-medium rounded-[0.5rem] hover:bg-[#D4D4D4] transition-colors"
          >
            Criar conta gratuita
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2A2A] px-6 md:px-12 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-lg font-display shimmer font-semibold">MakeUpMoney</span>
          <div className="flex gap-6 text-xs text-[#7A7A7A]">
            <Link href="#" className="hover:text-[#C0C0C0] transition-colors">Termos de Uso</Link>
            <Link href="#" className="hover:text-[#C0C0C0] transition-colors">Privacidade</Link>
            <Link href="/admin/login" className="hover:text-[#C0C0C0] transition-colors">Admin</Link>
          </div>
          <p className="text-xs text-[#7A7A7A]">© 2025 MakeUpMoney. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
