# Reconluz Premia

Sistema de gamificação da equipe comercial da Reconluz: cada ação vendável vale
pontos, o ranking atualiza em tempo real, e há bônus mensal de 200 pontos por
bater a meta do mês. Substitui a planilha `premiacao.xlsx` que a empresa usava
antes.

**Stack:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui, Supabase
(Postgres + Auth + RLS + Realtime + Storage), deploy na Vercel. PWA instalável.

## Setup local

```bash
npm install
cp .env.example .env.local   # preencha com a URL e a anon key do seu projeto Supabase
npm run dev
```

### Banco de dados (Supabase)

O schema completo está em `supabase/migrations/20260708000000_initial_schema.sql`
(tabelas, triggers de cálculo de pontos, RLS, views de ranking, bucket de
Storage). O seed inicial (13 ações do catálogo, 3 vendedoras, 12 metas mensais)
está em `supabase/seed.sql`.

Se você tiver o Supabase CLI logado e o projeto linkado, pode aplicar tudo com:

```bash
npx supabase link --project-ref <seu-project-ref>
npx supabase db push
```

`db push` só aplica as migrations — o seed em projetos remotos precisa ser
rodado manualmente uma vez: abra o **SQL Editor** do seu projeto no
[dashboard do Supabase](https://supabase.com/dashboard), cole o conteúdo de
`supabase/seed.sql` e execute.

Depois de aplicar as migrations, rode este SQL também no SQL Editor pra ligar
o Realtime nas tabelas usadas pelo ranking ao vivo (não é aplicado por
`db push`):

```sql
alter publication supabase_realtime add table public.registros;
alter publication supabase_realtime add table public.metas_atingidas;
```

### Criando o primeiro gestor

1. Em **Authentication → Users**, crie um usuário com o e-mail/senha do gestor.
2. No **SQL Editor**, promova esse usuário:
   ```sql
   update public.profiles set papel = 'gestor' where id = 'UUID-DO-USUARIO';
   ```

Vendedoras (Cris, Gabriela, Rafaela) já vêm cadastradas pelo seed com e-mails
placeholder (`cris@reconluz.com.br` etc.) — edite os e-mails delas em
**Vendedoras** no painel do gestor para os e-mails reais de cada uma *antes*
de criar as contas Auth correspondentes: o vínculo entre login e vendedora é
automático por e-mail (funciona em qualquer ordem — cadastro na Auth antes ou
depois de editar o e-mail na tabela `vendedoras`).

## Deploy na Vercel

1. Suba este repositório para o GitHub (se ainda não estiver lá).
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório. O
   framework preset "Vite" é detectado automaticamente.
3. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   (os mesmos valores do seu `.env.local` — nunca a service_role/secret key,
   essa não entra em nenhuma variável `VITE_*`, pois elas são embutidas no
   bundle público do navegador).
4. Deploy. Pronto — a Vercel builda com `npm run build` e serve `dist/`.

Repita o deploy (ou configure auto-deploy via push no GitHub) sempre que
quiser publicar mudanças.

## Estrutura do projeto

```
src/
  lib/          # supabase client, auth, tema, utilitários
  hooks/        # data fetching (vendedoras, catálogo, registros, ranking, metas...)
  components/   # componentes de UI, por domínio (registros/, ranking/, gamification/...)
  pages/        # páginas por papel (vendedora/, gestor/) + Ranking.tsx compartilhada
supabase/
  migrations/   # schema completo (tabelas, triggers, RLS, views, storage)
  seed.sql      # catálogo de ações, vendedoras e metas iniciais
```

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção (`tsc -b && vite build`)
- `npm run preview` — serve o build de produção localmente
- `npm run lint` — oxlint
