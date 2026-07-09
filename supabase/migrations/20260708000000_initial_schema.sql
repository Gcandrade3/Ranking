-- Reconluz Premia — schema inicial
-- Tabelas base, cálculo automático de pontos, papéis (gestor/vendedora),
-- fluxo de validação, metas mensais + bônus, ranking e storage de comprovantes.

-- =========================================================================
-- Tabelas base
-- =========================================================================

create table public.vendedoras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  avatar_url text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.acoes_catalogo (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  pontos integer not null check (pontos <> 0),
  categoria text,
  ativo boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  papel text not null default 'vendedora' check (papel in ('gestor', 'vendedora')),
  vendedora_id uuid references public.vendedoras (id) on delete set null,
  nome text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.registros (
  id uuid primary key default gen_random_uuid(),
  vendedora_id uuid not null references public.vendedoras (id) on delete cascade,
  acao_id uuid not null references public.acoes_catalogo (id),
  quantidade integer not null default 1 check (quantidade > 0),
  pontos_calculados integer not null default 0,
  cliente text,
  observacao text,
  comprovante_url text,
  status text not null default 'pendente' check (status in ('pendente', 'validado', 'rejeitado')),
  data_ocorrencia date not null default current_date,
  validado_por uuid references public.profiles (id),
  validado_em timestamptz,
  mes_apuracao integer,
  ano_apuracao integer,
  created_at timestamptz not null default now()
);

create index registros_vendedora_id_idx on public.registros (vendedora_id);
create index registros_status_idx on public.registros (status);
create index registros_apuracao_idx on public.registros (ano_apuracao, mes_apuracao);

create table public.metas_mensais (
  id uuid primary key default gen_random_uuid(),
  ano integer not null,
  mes integer not null check (mes between 1 and 12),
  descricao_meta text not null,
  pontos_bonus integer not null default 200,
  created_at timestamptz not null default now(),
  unique (ano, mes)
);

create table public.metas_atingidas (
  id uuid primary key default gen_random_uuid(),
  meta_mensal_id uuid not null references public.metas_mensais (id) on delete cascade,
  vendedora_id uuid not null references public.vendedoras (id) on delete cascade,
  atingido boolean not null default true,
  validado_por uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (meta_mensal_id, vendedora_id)
);

-- =========================================================================
-- Funções auxiliares (security definer para evitar recursão de RLS)
-- =========================================================================

create function public.is_gestor()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and papel = 'gestor'
  );
$$;

create function public.current_vendedora_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select vendedora_id from public.profiles where id = auth.uid();
$$;

-- Cria o profile (papel padrão 'vendedora') quando um usuário se cadastra no Auth,
-- já vinculando à vendedora cujo e-mail bate (se o gestor já tiver cadastrado ela antes).
-- Promoção a gestor é feita manualmente.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, vendedora_id)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nome',
    (select id from public.vendedoras where email = new.email limit 1)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cobre a ordem inversa: gestor cadastra/edita o e-mail da vendedora depois que
-- ela já tem uma conta no Auth — vincula o profile órfão que bate o e-mail.
create function public.link_vendedora_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set vendedora_id = new.id
  where vendedora_id is null
    and id in (select id from auth.users where email = new.email);
  return new;
end;
$$;

create trigger link_vendedora_profile_trigger
  after insert or update of email on public.vendedoras
  for each row execute function public.link_vendedora_profile();

-- Uma vendedora pode atualizar a própria linha (nome, avatar), mas nunca os campos
-- de privilégio (papel, vendedora_id) — só o gestor pode mudar esses dois.
-- auth.uid() is null em contextos administrativos (service_role key, SQL Editor,
-- migrations) — esses continuam livres para setar o papel inicial; é só a sessão
-- de um usuário comum tentando se autopromover que é bloqueada.
create function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_gestor() then
    new.papel := old.papel;
    new.vendedora_id := old.vendedora_id;
  end if;
  return new;
end;
$$;

create trigger protect_profile_fields_trigger
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- Pontos nunca vêm do client: sempre quantidade * pontos da ação no momento do lançamento.
create function public.calc_pontos_registro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select new.quantidade * acoes_catalogo.pontos
    into new.pontos_calculados
    from public.acoes_catalogo
    where acoes_catalogo.id = new.acao_id;
  return new;
end;
$$;

create trigger calc_pontos_registro_trigger
  before insert or update of quantidade, acao_id on public.registros
  for each row execute function public.calc_pontos_registro();

-- Marca o mês/ano de apuração no instante em que o gestor valida o registro
-- (a regra de negócio é: pontua no mês da validação, não no mês do fato).
create function public.set_apuracao_on_validate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'validado' and old.status is distinct from 'validado' then
    new.mes_apuracao := extract(month from now())::int;
    new.ano_apuracao := extract(year from now())::int;
    new.validado_em := now();
    new.validado_por := auth.uid();
  elsif new.status <> 'validado' then
    new.mes_apuracao := null;
    new.ano_apuracao := null;
    new.validado_em := null;
    new.validado_por := null;
  end if;
  return new;
end;
$$;

-- "insert or" também: o gestor lança a ação já como 'validado' direto (sem
-- passar por pendente), e OLD.status é null nesse caso — a condição
-- `old.status is distinct from 'validado'` já cobre isso corretamente.
create trigger set_apuracao_on_validate_trigger
  before insert or update of status on public.registros
  for each row execute function public.set_apuracao_on_validate();

-- =========================================================================
-- RLS
-- =========================================================================

alter table public.vendedoras enable row level security;
alter table public.acoes_catalogo enable row level security;
alter table public.profiles enable row level security;
alter table public.registros enable row level security;
alter table public.metas_mensais enable row level security;
alter table public.metas_atingidas enable row level security;

-- vendedoras: leitura liberada (nomes aparecem no ranking); escrita só gestor.
create policy vendedoras_select on public.vendedoras
  for select to authenticated using (true);
create policy vendedoras_insert on public.vendedoras
  for insert to authenticated with check (public.is_gestor());
create policy vendedoras_update on public.vendedoras
  for update to authenticated using (public.is_gestor());
create policy vendedoras_delete on public.vendedoras
  for delete to authenticated using (public.is_gestor());

-- acoes_catalogo: leitura liberada; escrita só gestor.
create policy acoes_catalogo_select on public.acoes_catalogo
  for select to authenticated using (true);
create policy acoes_catalogo_insert on public.acoes_catalogo
  for insert to authenticated with check (public.is_gestor());
create policy acoes_catalogo_update on public.acoes_catalogo
  for update to authenticated using (public.is_gestor());
create policy acoes_catalogo_delete on public.acoes_catalogo
  for delete to authenticated using (public.is_gestor());

-- profiles: cada um lê/atualiza o próprio; gestor lê e atualiza todos.
-- Os campos de privilégio (papel, vendedora_id) são protegidos pelo trigger acima,
-- não pela policy — aqui só controlamos "de quem é a linha".
create policy profiles_select on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_gestor());
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_gestor())
  with check (id = auth.uid() or public.is_gestor());

-- registros: só o gestor lança/edita/exclui (ele é quem opera o sistema).
-- Vendedora só enxerga os próprios registros (extrato/ranking), nunca escreve.
create policy registros_select on public.registros
  for select to authenticated
  using (vendedora_id = public.current_vendedora_id() or public.is_gestor());

create policy registros_insert on public.registros
  for insert to authenticated
  with check (public.is_gestor());

create policy registros_update on public.registros
  for update to authenticated
  using (public.is_gestor())
  with check (public.is_gestor());

create policy registros_delete on public.registros
  for delete to authenticated
  using (public.is_gestor());

-- metas_mensais: leitura liberada; escrita só gestor.
create policy metas_mensais_select on public.metas_mensais
  for select to authenticated using (true);
create policy metas_mensais_insert on public.metas_mensais
  for insert to authenticated with check (public.is_gestor());
create policy metas_mensais_update on public.metas_mensais
  for update to authenticated using (public.is_gestor());
create policy metas_mensais_delete on public.metas_mensais
  for delete to authenticated using (public.is_gestor());

-- metas_atingidas: leitura liberada (extrato/ranking mostram o bônus); marcação só gestor.
create policy metas_atingidas_select on public.metas_atingidas
  for select to authenticated using (true);
create policy metas_atingidas_insert on public.metas_atingidas
  for insert to authenticated with check (public.is_gestor());
create policy metas_atingidas_update on public.metas_atingidas
  for update to authenticated using (public.is_gestor());
create policy metas_atingidas_delete on public.metas_atingidas
  for delete to authenticated using (public.is_gestor());

-- =========================================================================
-- Views de ranking
--
-- Rodam com o privilégio do owner (comportamento padrão de view no Postgres),
-- ou seja, ignoram deliberadamente a RLS de `registros`/`metas_atingidas` para
-- expor o AGREGADO (pontos por vendedora/mês) a todo mundo autenticado — é
-- assim que o ranking funciona. Nenhum dado sensível (cliente, observação,
-- comprovante) é exposto aqui, só nome + pontos. Não adicionar
-- `security_invoker` a estas views sem revisar esse trade-off.
-- =========================================================================

create view public.ranking_registros as
select
  vendedora_id,
  ano_apuracao as ano,
  mes_apuracao as mes,
  sum(pontos_calculados) as pontos
from public.registros
where status = 'validado'
group by vendedora_id, ano_apuracao, mes_apuracao;

create view public.ranking_bonus as
select
  ma.vendedora_id,
  mm.ano,
  mm.mes,
  sum(mm.pontos_bonus) as pontos
from public.metas_atingidas ma
join public.metas_mensais mm on mm.id = ma.meta_mensal_id
where ma.atingido = true
group by ma.vendedora_id, mm.ano, mm.mes;

create view public.ranking_mensal as
with periodos as (
  select vendedora_id, ano, mes from public.ranking_registros
  union
  select vendedora_id, ano, mes from public.ranking_bonus
)
select
  p.vendedora_id,
  v.nome,
  v.avatar_url,
  p.ano,
  p.mes,
  coalesce(rr.pontos, 0) as pontos_registros,
  coalesce(rb.pontos, 0) as pontos_bonus,
  coalesce(rr.pontos, 0) + coalesce(rb.pontos, 0) as pontos_total
from periodos p
join public.vendedoras v on v.id = p.vendedora_id
left join public.ranking_registros rr
  on rr.vendedora_id = p.vendedora_id and rr.ano = p.ano and rr.mes = p.mes
left join public.ranking_bonus rb
  on rb.vendedora_id = p.vendedora_id and rb.ano = p.ano and rb.mes = p.mes;

create view public.ranking_anual as
select
  vendedora_id,
  nome,
  avatar_url,
  ano,
  sum(pontos_registros) as pontos_registros,
  sum(pontos_bonus) as pontos_bonus,
  sum(pontos_total) as pontos_total
from public.ranking_mensal
group by vendedora_id, nome, avatar_url, ano;

grant select on public.ranking_registros to authenticated;
grant select on public.ranking_bonus to authenticated;
grant select on public.ranking_mensal to authenticated;
grant select on public.ranking_anual to authenticated;

-- Realtime: o front assina mudanças em registros/metas_atingidas para recalcular
-- o ranking na hora (as views em si não são assinaváveis, só tabelas base).
alter publication supabase_realtime add table public.registros;
alter publication supabase_realtime add table public.metas_atingidas;

-- =========================================================================
-- Storage — comprovantes (bucket privado, path {vendedora_id}/{registro_id}/arquivo)
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('comprovantes', 'comprovantes', false)
on conflict (id) do nothing;

create policy comprovantes_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'comprovantes'
    and (
      public.is_gestor()
      or (storage.foldername(name))[1] = public.current_vendedora_id()::text
    )
  );

create policy comprovantes_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'comprovantes'
    and (
      public.is_gestor()
      or (storage.foldername(name))[1] = public.current_vendedora_id()::text
    )
  );

create policy comprovantes_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'comprovantes'
    and (
      public.is_gestor()
      or (storage.foldername(name))[1] = public.current_vendedora_id()::text
    )
  );

create policy comprovantes_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'comprovantes'
    and (
      public.is_gestor()
      or (storage.foldername(name))[1] = public.current_vendedora_id()::text
    )
  );
