<div align="center">

# Área de Membros

**Uma plataforma de acesso exclusivo, construída do zero com segurança real.**

Cada membro é aprovado por você — manualmente, com intenção.  
Nenhum email entra sem a sua autorização. Nenhuma rota abre sem autenticação.

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## Por que isso existe

Toda vez que alguém me perguntava "qual plataforma você usa pra área de membros?" eu olhava pras opções e via a mesma coisa: sistemas genéricos, interfaces feias, pouco controle real sobre quem entra.

Então construí o meu. Do jeito que eu queria.

- **Design intencional** — gradiente escuro, fundo quadriculado, botões com animação de contorno em conic-gradient
- **Segurança que vai fundo** — o banco de dados rejeita usuários não autorizados em nível de trigger, antes mesmo do código rodar
- **Curadoria manual** — o admin aprova cada pessoa uma a uma. Sem auto-registro, sem spam, sem ruído

---

## Funcionalidades

### Para os membros
- **Solicitar acesso** com nome e e-mail — sem senha, sem formulário gigante
- **Receber convite por email** assim que o admin aprovar
- **Acessar o painel** com senha ou link mágico (magic link)
- **Assistir aulas** organizadas por módulo e posição

### Para o admin
- **Painel protegido por chave secreta** — nenhuma rota admin abre sem a chave certa
- **Gerenciar solicitações** — aprovar ou rejeitar com um clique; o convite é enviado automaticamente
- **Liberar acesso direto** — adicionar emails sem precisar de solicitação
- **Revogar acesso** — remove o membro da allow-list e deleta o usuário do auth
- **Publicar aulas** — título, descrição, módulo, posição, URL do vídeo e thumbnail

---

## Como a segurança funciona

Essa parte é a que mais gosto de contar.

**Camada 1 — Trigger no banco**  
Um trigger no PostgreSQL rejeita qualquer `INSERT` em `auth.users` cujo email não esteja na tabela `allowed_emails`. Não importa se alguém tenta via API, via SDK ou direto no SQL — o banco bloqueia.

**Camada 2 — RLS estrita**  
Cada tabela tem Row Level Security com políticas específicas. A `allowed_emails`, por exemplo, não tem nenhuma policy: só o service role (server-side) consegue tocá-la. Um cliente nunca lê ou escreve lá.

**Camada 3 — Sessão admin via HMAC**  
O painel admin usa um cookie `HttpOnly` assinado com HMAC SHA-256. Sem JWT, sem banco de sessões — só uma assinatura criptográfica com TTL de 4 horas verificada a cada request.

**Camada 4 — Rate limiting e anti-enumeração**  
Signup e login admin têm limite de 5 requisições por minuto por IP. O signup sempre responde da mesma forma, seja email novo ou duplicado — não dá pra descobrir se um email já solicitou acesso.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS v3 |
| Auth + DB | Supabase (PostgreSQL) |
| Fontes | Inter + Space Grotesk |

---

## Instalação

### Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com) (plano gratuito funciona)

### 1. Clone e instale
```bash
git clone https://github.com/arthurbarbosadev/area-de-membros.git
cd area-de-membros
npm install
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
```

Preencha `.env.local` com:
- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` — em **Project Settings > API** no Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — o campo **service_role** (nunca expor no frontend)
- `ADMIN_SECRET_KEY` — qualquer string aleatória com 32+ chars
- `ADMIN_SESSION_SECRET` — outra string aleatória diferente da acima

Para gerar os segredos:
```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
```

### 3. Aplique o schema no Supabase

Copie e execute o SQL abaixo no **SQL Editor** do seu projeto Supabase:

<details>
<summary>Ver SQL completo</summary>

```sql
create extension if not exists "pgcrypto";

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles: user reads own" on public.profiles for select using (auth.uid() = id);

-- Allow-list
create table public.allowed_emails (
  email text primary key,
  added_by uuid references auth.users(id),
  added_at timestamptz not null default now()
);
alter table public.allowed_emails enable row level security;

-- Signup requests
create type public.signup_status as enum ('pending', 'approved', 'rejected');
create table public.signup_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 80),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  status public.signup_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);
create unique index signup_requests_pending_email_uq on public.signup_requests (lower(email)) where status = 'pending';
alter table public.signup_requests enable row level security;
create policy "signup_requests: anon insert" on public.signup_requests for insert to anon
  with check (char_length(full_name) between 2 and 80 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- Lessons
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text,
  thumbnail_url text,
  module text default 'Geral',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
alter table public.lessons enable row level security;
create policy "lessons: authenticated read" on public.lessons for select to authenticated using (true);

-- Auth gate trigger
create or replace function public.enforce_allowed_email() returns trigger language plpgsql security definer set search_path = public as $fn$
begin
  if not exists (select 1 from public.allowed_emails ae where lower(ae.email) = lower(new.email)) then
    raise exception 'EMAIL_NOT_ALLOWED' using errcode = '42501';
  end if;
  return new;
end; $fn$;
revoke execute on function public.enforce_allowed_email() from public, anon, authenticated;
create trigger trg_enforce_allowed_email before insert on auth.users for each row execute function public.enforce_allowed_email();

-- Profile auto-creation
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $fn$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;
  return new;
end; $fn$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
create trigger trg_on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
```

</details>

### 4. Rode localmente
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

---

## Uso

| URL | O que é |
|---|---|
| `/` | Landing page |
| `/signup` | Formulário de solicitação de acesso |
| `/login` | Login por senha ou magic link |
| `/dashboard` | Área de membros (protegida) |
| `/admin` | Gate do painel administrativo |
| `/admin/console` | Painel completo (aprovações, membros, aulas) |

**Fluxo principal:**
1. Visitante preenche `/signup` → entra na fila como `pending`
2. Admin abre `/admin`, digita a chave secreta
3. Na aba *Solicitações*, clica em *Aprovar* → sistema adiciona o email à allow-list e envia convite automático via Supabase
4. Usuário recebe email, clica no link → é redirecionado para `/dashboard`

---

## Deploy

Funciona em qualquer plataforma que suporte Next.js. Recomendo [Vercel](https://vercel.com) pela zero-config.

Não esqueça de configurar as mesmas variáveis de ambiente na plataforma escolhida — especialmente `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SECRET_KEY` e `ADMIN_SESSION_SECRET`.

---

## Contribuindo

Tem uma ideia? Encontrou um problema? Pull requests são bem-vindos.

1. Fork o projeto
2. Crie sua branch: `git checkout -b feature/minha-ideia`
3. Commit: `git commit -m 'feat: minha ideia'`
4. Push: `git push origin feature/minha-ideia`
5. Abra um Pull Request

---

## Licença

MIT — use, modifique, distribua como quiser. Créditos são sempre simpáticos, mas não obrigatórios.

---

<div align="center">

Feito com intenção por [Arthur Barbosa](https://github.com/arthurbarbosadev)

</div>
#   a r t h u r b a r b o s a d e v  
 