# Guia de Deploy em Produção — Portal Empire

Este documento contém o passo a passo completo, detalhado e auditável para implantar o **Portal Empire** em ambiente de produção utilizando a stack oficial: **Next.js 15 (App Router)** na **Vercel**, **Supabase** (PostgreSQL + Auth + Storage), **Asaas** (Gateway de Pagamentos e Split) e **Resend** (E-mails transacionais).

---

## 1. Pré-Requisitos

Antes de iniciar o deploy, garanta que possui as seguintes contas e recursos provisionados:

1. **Conta na Vercel** (plano Hobby ou Pro).
2. **Projeto no Supabase** (PostgreSQL 15+ com extensões `uuid-ossp`, `pgcrypto` e `unaccent`).
3. **Conta no Asaas** (Ambiente de Produção homologado para PIX, Cartão e Boleto com Split de Pagamento).
4. **Conta no Resend** (Chave de API e domínio configurado com SPF/DKIM para e-mails transacionais).
5. **Domínio próprio registrado** (ex: `portalempire.com.br` no Registro.br, Cloudflare ou similar).
6. **Repositório Git** (GitHub, GitLab ou Bitbucket) sincronizado com a branch `main`.

---

## 2. Passo 1 — Configuração do Banco de Dados (Supabase)

### 2.1 Executar as Migrations do Schema e RLS
No painel do Supabase, acesse **SQL Editor** e execute na ordem:

1. [`supabase/migrations/20261009000001_initial_schema.sql`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/supabase/migrations/20261009000001_initial_schema.sql):
   - Cria todos os enums (`user_role`, `user_status`, `materia_status`, etc.).
   - Cria as 17 tabelas com integridade referencial, foreign keys e triggers de `updated_at`.
   - Cria os 4 buckets de Storage públicos (`materias`, `perfis`, `colunas`, `anuncios`).
   - Habilita Row Level Security (RLS) em 100% das tabelas.
   - Cria as Views públicas (`autores_publicos`, `anuncios_ativos_publicos`).
   - Cria as Funções Security Definer (`incrementar_visualizacao`, `incrementar_metrica`, `handle_new_user`).

2. [`supabase/seed.sql`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/supabase/seed.sql):
   - Popula o portal inicial padrão.
   - Cadastra as 18 editorias temáticas e hierárquicas com cores e palavras-chave.
   - Cadastra as 10 principais cidades em destaque.
   - Cadastra os 5 formatos padrão de anúncios publicitários com dimensões desktop/mobile e preços mínimos.
   - Cadastra as configurações globais da plataforma (`comissao_padrao_percentual`, `autocadastro_colunista`, `aprovar_colunas_manual`, etc.).
   - Cadastra o catálogo inicial de fontes RSS dos veículos de comunicação.

### 2.2 Coleta de Credenciais do Supabase
No painel do Supabase, acesse **Project Settings > API** e anote:
- `Project URL` (ex: `https://xyzproject.supabase.co`)
- `anon public key`
- `service_role key` (⚠️ Nunca compartilhe ou insira no código do client)

---

## 3. Passo 2 — Configuração do Asaas (Pagamentos e Split)

1. Acesse o painel do Asaas em Produção (**Configurações da Conta > Integrações > Chaves de API**).
2. Gere a **Chave de API de Produção** e anote como `ASAAS_API_KEY`.
3. Em **Webhooks para Cobranças**:
   - URL do Webhook: `https://portalempire.com.br/api/webhooks/asaas`
   - Versão da API: `v3`
   - Fila de Sincronização: Ativa
   - Token de Autenticação: Defina uma string segura e anote como `ASAAS_WEBHOOK_TOKEN`
   - Eventos Habilitados:
     - `PAYMENT_RECEIVED` (Pagamento recebido em dinheiro/saldo)
     - `PAYMENT_CONFIRMED` (Pagamento confirmado via PIX ou Cartão)
     - `PAYMENT_OVERDUE` (Cobrança vencida)
     - `PAYMENT_REFUNDED` (Cobrança estornada)

---

## 4. Passo 3 — Configuração das Variáveis de Ambiente na Vercel

No painel da Vercel, acesse **Project Settings > Environment Variables** e adicione as seguintes variáveis para o ambiente `Production`:

| Variável | Descrição | Exemplo de Valor |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública da API do Supabase | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública anônima do Supabase | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave privada Service Role (Server-Only) | `eyJhbGciOi...` |
| `CRON_SECRET` | Token secreto para proteção dos cron jobs | `cron_prod_secret_8f7b...` |
| `ASAAS_API_KEY` | Chave de API do gateway Asaas | `$aact_YTU5Y...` |
| `ASAAS_ENV` | Ambiente do gateway (`production` ou `sandbox`) | `production` |
| `ASAAS_WEBHOOK_TOKEN` | Token de validação do webhook do Asaas | `token_webhook_sec_...` |
| `RESEND_API_KEY` | Chave de API para envio de e-mails | `re_123456789...` |
| `NEXT_PUBLIC_SITE_URL` | URL canônica do portal em produção | `https://portalempire.com.br` |

---

## 5. Passo 4 — Deploy e Cron Jobs na Vercel

1. No painel da Vercel, importe o repositório Git e clique em **Deploy**.
2. A Vercel detectará automaticamente o arquivo [`vercel.json`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/vercel.json), que agenda os 3 cron jobs nativos:
   - `*/5 * * * *` (`POST /api/cron/captacao`): Coleta automática de notícias dos feeds RSS a cada 5 minutos.
   - `*/5 * * * *` (`POST /api/cron/publicar-agendadas`): Publicação de matérias jornalísticas agendadas.
   - `5 0 * * *` (`POST /api/cron/anuncios`): Ativação diária de anúncios iniciados e expiração de vencidos.

> [!NOTE]
> Para testar os endpoints de Cron manualmente via cURL ou Postman, envie o header:
> `Authorization: Bearer <SEU_CRON_SECRET>`

---

## 6. Passo 5 — Criação do Primeiro Administrador

Com o banco de dados online e as variáveis configuradas, execute o script de provisionamento administrativo localmente apontando para as credenciais de produção:

```bash
npx tsx scripts/criar-admin.ts admin@portalempire.com.br "SenhaForteSegura123!"
```

O script realizará:
1. Criação do usuário autenticado no `auth.users` com e-mail confirmado.
2. Atualização automática do registro em `profiles` para `role: 'admin'` e `status: 'ativo'`.
3. Registro do evento na tabela `auditoria`.

---

## 7. Passo 6 — Configuração de DNS e Domínio

No seu provedor de DNS (ex: Cloudflare ou Registro.br), crie os seguintes apontamentos:

1. **Domínio Raiz (`portalempire.com.br`)**:
   - Tipo: `A` | Nome: `@` | Conteúdo: `76.76.21.21` (IP Anycast da Vercel)
2. **Subdomínio (`www.portalempire.com.br`)**:
   - Tipo: `CNAME` | Nome: `www` | Conteúdo: `cname.vercel-dns.com.`
3. **E-mails (SPF & DKIM do Resend)**:
   - Adicione os registros TXT e MX indicados no painel do Resend para habilitar o envio de e-mails transacionais a partir do seu domínio.

---

## 8. Passo 7 — Checklist Final de Go-Live (Validação em Produção)

- [ ] Acessar `https://portalempire.com.br` e validar o carregamento da Home com SSL ativo.
- [ ] Acessar `/login` e entrar com o usuário administrador criado.
- [ ] No painel `/painel/admin/aparencia`, definir o nome do portal, logomarca, cor primária e redes sociais.
- [ ] Testar a criação de uma matéria com imagem de capa e verificar se ela é renderizada na Home.
- [ ] No painel `/painel/admin/captacao`, clicar em "Executar Agora" para coletar as primeiras notícias via RSS.
- [ ] Acessar `/painel/colunista/financeiro` e verificar a conexão com o Asaas.
- [ ] Testar um fluxo de compra de anúncio e validar a geração do QR Code PIX.
- [ ] Verificar os logs de auditoria em `/painel/admin/auditoria`.
