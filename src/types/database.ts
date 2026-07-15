// Tipos manuais espelhando supabase/migrations/20260708000000_initial_schema.sql.
// Depois que o projeto Supabase existir, regenerar com:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
//
// Usamos `type` (não `interface`) porque interfaces não satisfazem o construtor
// `Record<string, unknown>` que o supabase-js exige internamente para cada tabela.

export type Papel = 'gestor' | 'vendedora' | 'visualizador'
export type StatusRegistro = 'pendente' | 'validado' | 'rejeitado'

export type Vendedora = {
  id: string
  nome: string
  email: string
  avatar_url: string | null
  ativo: boolean
  created_at: string
}

export type AcaoCatalogo = {
  id: string
  descricao: string
  pontos: number
  categoria: string | null
  ativo: boolean
  ordem: number
  created_at: string
}

export type Profile = {
  id: string
  papel: Papel
  vendedora_id: string | null
  nome: string | null
  avatar_url: string | null
  created_at: string
}

export type Registro = {
  id: string
  vendedora_id: string
  acao_id: string
  quantidade: number
  pontos_calculados: number
  cliente: string | null
  observacao: string | null
  comprovante_url: string | null
  status: StatusRegistro
  data_ocorrencia: string
  validado_por: string | null
  validado_em: string | null
  mes_apuracao: number | null
  ano_apuracao: number | null
  created_at: string
}

export type MetaMensal = {
  id: string
  ano: number
  mes: number
  descricao_meta: string
  pontos_bonus: number
  created_at: string
}

export type MetaAtingida = {
  id: string
  meta_mensal_id: string
  vendedora_id: string
  atingido: boolean
  validado_por: string | null
  created_at: string
}

export type RankingMensal = {
  vendedora_id: string
  nome: string
  avatar_url: string | null
  ano: number
  mes: number
  pontos_registros: number
  pontos_bonus: number
  pontos_total: number
}

export type RankingAnual = {
  vendedora_id: string
  nome: string
  avatar_url: string | null
  ano: number
  pontos_registros: number
  pontos_bonus: number
  pontos_total: number
}

export type Database = {
  public: {
    Tables: {
      vendedoras: {
        Row: Vendedora
        Insert: Partial<Vendedora>
        Update: Partial<Vendedora>
        Relationships: []
      }
      acoes_catalogo: {
        Row: AcaoCatalogo
        Insert: Partial<AcaoCatalogo>
        Update: Partial<AcaoCatalogo>
        Relationships: []
      }
      profiles: {
        Row: Profile
        Insert: Partial<Profile>
        Update: Partial<Profile>
        Relationships: []
      }
      registros: {
        Row: Registro
        Insert: Partial<Registro>
        Update: Partial<Registro>
        Relationships: []
      }
      metas_mensais: {
        Row: MetaMensal
        Insert: Partial<MetaMensal>
        Update: Partial<MetaMensal>
        Relationships: []
      }
      metas_atingidas: {
        Row: MetaAtingida
        Insert: Partial<MetaAtingida>
        Update: Partial<MetaAtingida>
        Relationships: []
      }
    }
    Views: {
      ranking_mensal: { Row: RankingMensal; Relationships: [] }
      ranking_anual: { Row: RankingAnual; Relationships: [] }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
