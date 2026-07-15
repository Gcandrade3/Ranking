-- Adiciona o papel 'visualizador': contas que só enxergam o ranking, sem
-- vendedora_id vinculado, sem dashboard pessoal e sem nenhuma permissão de
-- escrita (todas as policies de escrita já exigem is_gestor(), então esse
-- papel automaticamente fica só-leitura nas tabelas operacionais).
alter table public.profiles drop constraint profiles_papel_check;
alter table public.profiles add constraint profiles_papel_check
  check (papel in ('gestor', 'vendedora', 'visualizador'));
