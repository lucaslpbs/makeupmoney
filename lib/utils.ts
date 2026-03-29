import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateFull(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const CATEGORIAS_PRODUTO = [
  "Base",
  "Corretivo",
  "Contorno",
  "Iluminador",
  "Blush",
  "Primer",
  "Pó",
  "Sombra",
  "Delineador",
  "Máscara de cílios",
  "Lápis",
  "Batom",
  "Gloss",
  "Fixador",
  "Preparador de pele",
  "Óleo",
  "Hidratante",
  "Pincel / Esponja",
  "Outros",
] as const;

export const CATEGORIAS_CUSTO_FIXO = [
  "Aluguel",
  "Energia elétrica",
  "Internet",
  "Marketing / Publicidade",
  "Transporte",
  "Cursos e capacitações",
  "Pró-labore",
  "Ferramentas e aplicativos",
  "Materiais descartáveis",
  "Contabilidade",
  "Outros",
] as const;

export const TIPOS_ATUACAO = [
  { value: "social", label: "Maquiagem Social" },
  { value: "noiva", label: "Maquiagem para Noivas" },
  { value: "editorial", label: "Maquiagem Editorial" },
  { value: "autonoma", label: "Autônoma Geral" },
  { value: "outro", label: "Outro" },
] as const;

export const UNIDADES = [
  { value: "ml", label: "ml (mililitros)" },
  { value: "g", label: "g (gramas)" },
  { value: "un", label: "un (unidades)" },
] as const;

export const PLANOS = {
  essencial: {
    nome: "Essencial",
    valor: 29.9,
    descricao: "Para quem está começando a precificar",
    recursos: [
      "Calculadora de precificação",
      "Cadastro de produtos",
      "Custos fixos",
      "Até 20 produtos",
    ],
  },
  profissional: {
    nome: "Profissional",
    valor: 59.9,
    descricao: "Para maquiadoras que querem crescer",
    recursos: [
      "Tudo do Essencial",
      "Metas financeiras",
      "Histórico de simulações",
      "Gestão de clientes",
      "Dashboard completo",
      "Produtos ilimitados",
    ],
  },
  premium: {
    nome: "Premium",
    valor: 97.0,
    descricao: "Para profissionais que querem excelência",
    recursos: [
      "Tudo do Profissional",
      "Conteúdos exclusivos MakeUpMoney",
      "Suporte prioritário",
      "Relatórios avançados",
    ],
  },
} as const;
