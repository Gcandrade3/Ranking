-- View de extrato: mostra, para cada vendedora, o detalhe de onde vieram os
-- pontos (ação + quando + quanto), incluindo bônus de meta batida. Assim como
-- as views de ranking, roda com o privilégio do owner e ignora a RLS de
-- propósito para expor esse detalhe a qualquer usuário autenticado — inclusive
-- contas 'visualizador' sem vendedora_id vinculado. Só campos não sensíveis
-- (nunca cliente, observação ou comprovante).
create view public.extrato_pontos as
select
  r.id,
  r.vendedora_id,
  r.ano_apuracao as ano,
  r.mes_apuracao as mes,
  r.data_ocorrencia,
  ac.descricao,
  coalesce(ac.categoria, 'outros') as categoria,
  r.pontos_calculados as pontos
from public.registros r
join public.acoes_catalogo ac on ac.id = r.acao_id
where r.status = 'validado'

union all

select
  ma.id,
  ma.vendedora_id,
  mm.ano,
  mm.mes,
  null::date as data_ocorrencia,
  'Meta batida: ' || mm.descricao_meta as descricao,
  'bonus' as categoria,
  mm.pontos_bonus as pontos
from public.metas_atingidas ma
join public.metas_mensais mm on mm.id = ma.meta_mensal_id
where ma.atingido = true;

grant select on public.extrato_pontos to authenticated;
