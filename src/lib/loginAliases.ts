// O Supabase Auth só autentica por e-mail — não existe "login por nome" nativo.
// Para as contas de visualizador (só ranking), a vendedora digita apenas o
// nome e aqui traduzimos para o e-mail sintético cadastrado no Auth.
// Domínio @reconluz.local propositalmente diferente do e-mail real das
// vendedoras (@reconluz.com.br) para não colidir com o vínculo automático
// de vendedora_id feito pelo trigger handle_new_user().
const ALIASES: Record<string, string> = {
  cris: 'cris@reconluz.local',
  gabriela: 'gabriela@reconluz.local',
  rafaela: 'rafaela@reconluz.local',
}

function normalizar(valor: string) {
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export function resolverEmailDeLogin(identificador: string): string | null {
  const valor = identificador.trim()
  if (valor.includes('@')) return valor
  return ALIASES[normalizar(valor)] ?? null
}
