-- Seed inicial do Reconluz Premia — catálogo de ações, vendedoras e metas do ano.
-- Aplicado automaticamente por `supabase db reset` (local) ou manualmente em produção.

insert into public.acoes_catalogo (descricao, pontos, categoria, ordem) values
  ('Cliente respondeu proposta', 5, 'prospeccao', 1),
  ('Agendou visita', 10, 'prospeccao', 2),
  ('Indicação recebida', 10, 'relacionamento', 3),
  ('Cliente avaliou a empresa no Google', 50, 'relacionamento', 4),
  ('Venda de manutenção/contrato', 50, 'venda', 5),
  ('Venda de energia por assinatura', 50, 'venda', 6),
  ('Venda Fechada Comum', 100, 'venda', 7),
  ('Venda Fechada Cliente Recuperado', 150, 'venda', 8),
  ('Venda Fechada anúncio', 150, 'venda', 9),
  ('Venda Fechada por indicação', 180, 'venda', 10),
  ('Venda kit ≥ 2k', 180, 'venda', 11),
  ('Venda CNPJ', 180, 'venda', 12),
  ('Venda kit ≥ 4k', 250, 'venda', 13),
  ('1 dia sem métricas', -50, 'penalidade', 14),
  ('Lead sem cadência', -50, 'penalidade', 15),
  ('1 dia sem proposta', -50, 'penalidade', 16),
  ('1 semana sem chamada de vídeo', -100, 'penalidade', 17),
  ('1 semana sem proposta de indicação', -100, 'penalidade', 18),
  ('15 dias sem visita', -100, 'penalidade', 19),
  ('15 dias sem venda', -100, 'penalidade', 20);

-- E-mails placeholder — o gestor deve atualizar para o e-mail real de cada vendedora
-- (precisa bater com o e-mail usado no cadastro do Supabase Auth para o profile linkar).
insert into public.vendedoras (nome, email) values
  ('Cris', 'cris@reconluz.com.br'),
  ('Gabriela', 'gabriela@reconluz.com.br'),
  ('Rafaela', 'rafaela@reconluz.com.br');

insert into public.metas_mensais (ano, mes, descricao_meta, pontos_bonus)
select extract(year from current_date)::int, mes, descricao, 200
from (values
  (1, 'ESCOLA'),
  (2, 'ESCOLA'),
  (3, 'CNPJ'),
  (4, 'Kit 2000'),
  (5, 'Indicação'),
  (6, 'Indicação'),
  (7, 'Kit 2500'),
  (8, 'Condomínio'),
  (9, 'Condomínio'),
  (10, 'CNPJ'),
  (11, 'Kit 2500'),
  (12, 'ESCOLA')
) as t(mes, descricao);
