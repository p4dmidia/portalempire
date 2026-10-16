# PRD — Portal de Notícias de Cidades com Colunistas e Marketplace de Anúncios

> Documento de requisitos do produto. Fonte única de verdade para o desenvolvimento.
> Toda decisão de implementação deve seguir este documento. Em caso de dúvida, consultar aqui antes de inventar.

---

## 1. Visão geral

Portal de notícias regional (estilo "Empire Cidades") com:

1. **Portal público** com home em blocos, editorias, cidades, matérias, colunas e páginas de colunistas.
2. **Captação automática de notícias** de grandes portais brasileiros via **RSS**, publicada automaticamente.
3. **Área de editores e colunistas** com login e senha, onde cada um cria e gerencia **apenas o próprio conteúdo**.
4. **Colunas de cidades**: colunistas criam páginas próprias vinculadas a uma cidade.
5. **Marketplace de anúncios**: colunistas vendem espaços publicitários dentro das suas colunas, com split de pagamento e comissão para a plataforma.
6. **Painel administrativo** que gerencia tudo.

### 1.1 Objetivos
- Portal sempre atualizado sem esforço manual (captação automática).
- Gerar receita via anúncios (da plataforma e dos colunistas, com comissão).
- SEO forte: o portal precisa ranquear no Google.
- Arquitetura preparada para, no futuro, rodar **vários portais** (multi-tenant) no mesmo sistema.

### 1.2 Fora do escopo (v1)
- App mobile nativo.
- Comentários de leitores.
- Paywall/assinatura de leitores.
- **Raspagem (scraping) do texto integral das matérias de terceiros.** A captação usa apenas os dados que o próprio feed RSS fornece (título, resumo, imagem, data, link).

---

## 2. Stack técnica

| Camada | Tecnologia |
|---|---|
| Framework | **Next.js 15** (App Router) + **TypeScript** |
| UI | **Tailwind CSS** + **shadcn/ui** + lucide-react |
| Banco / Auth / Storage | **Supabase** (Postgres, Supabase Auth, Storage, Row Level Security) |
| Editor de texto | **Tiptap** (rich text, imagens, embeds YouTube) |
| Captação RSS | `rss-parser` rodando em rota de API protegida, disparada por **cron** (Vercel Cron ou Supabase pg_cron + pg_net) |
| Pagamentos | **Asaas** (PIX, boleto, cartão) com **split de pagamento** via subcontas/walletId |
| Hospedagem | **Vercel** (frontend + API routes) + Supabase Cloud |
| Validação | **Zod** |
| Formulários | react-hook-form |
| Datas | date-fns (pt-BR) |
| Imagens | `next/image` + Supabase Storage |

### 2.1 Princípios de arquitetura
- **Segurança no banco**: todas as tabelas com **RLS ativo**. A regra "cada um só vê o que cria" é garantida por política RLS, não só pelo frontend.
- **Server Components** para páginas públicas (SEO + performance). Client Components só onde há interatividade.
- **ISR/revalidação**: páginas públicas cacheadas e revalidadas (`revalidate` de 60s na home, `revalidatePath` ao publicar).
- **Service role key** usada **somente** no servidor (cron de captação, webhooks de pagamento). Nunca no client.
- Toda tabela de conteúdo tem `portal_id` (preparação multi-tenant), mesmo que na v1 exista um único portal.

---

## 3. Perfis de usuário e permissões

| Perfil | Descrição | Pode |
|---|---|---|
| `admin` | Dono da plataforma | Tudo. Gerencia usuários, fontes RSS, editorias, cidades, anúncios da plataforma, comissões, configurações, moderação de qualquer conteúdo. |
| `editor` | Jornalista/redator | Criar, editar e excluir **as próprias matérias**. Ver a fila de notícias captadas (somente leitura + despublicar). Não vê matérias de outros editores no painel. |
| `colunista` | Dono de coluna | Criar e gerenciar **as próprias colunas**, **os próprios artigos**, **os próprios espaços de anúncio, anunciantes e anúncios**. Ver o próprio financeiro. Não vê nada de outro colunista. |
| `anunciante` (opcional v1) | Cliente que compra anúncio | Ver **apenas os próprios anúncios** e métricas (impressões/cliques). |

Regras:
- Cadastro de editor/colunista é feito **pelo admin** (convite por e-mail) OU por autocadastro que fica com status `pendente` até o admin aprovar. Configurável.
- Usuário com `status = bloqueado` não acessa o painel.
- O perfil fica em `profiles.role`. Uma função SQL `public.current_role()` retorna o role do usuário logado para uso nas políticas RLS.

---

## 4. Modelo de dados (Postgres / Supabase)

> Todas as tabelas: `id uuid primary key default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at timestamptz default now()` (trigger), exceto onde indicado.

### 4.1 `portais`
| campo | tipo | obs |
|---|---|---|
| nome | text | |
| slug | text unique | |
| dominio | text | ex.: portal.com.br |
| logo_url | text | |
| cor_primaria | text | hex |
| descricao_seo | text | |
| redes_sociais | jsonb | instagram, facebook, youtube... |
| youtube_live_url | text | bloco "TV ao vivo" |
| config | jsonb | flags gerais |

### 4.2 `profiles` (1:1 com `auth.users`)
| campo | tipo | obs |
|---|---|---|
| id | uuid PK FK auth.users | |
| portal_id | uuid FK | |
| nome | text | |
| slug | text unique | URL pública `/autor/[slug]` |
| email | text | |
| role | enum `user_role` (admin, editor, colunista, anunciante) | |
| status | enum (pendente, ativo, bloqueado) | |
| foto_url | text | |
| bio | text | |
| redes_sociais | jsonb | |
| asaas_wallet_id | text | para receber split (colunista) |
| cpf_cnpj | text | necessário para subconta Asaas |
| telefone | text | |

### 4.3 `cidades`
| campo | tipo |
|---|---|
| portal_id | uuid FK |
| nome | text |
| slug | text |
| uf | char(2) |
| destaque_menu | boolean | aparece no submenu "Cidades" |
| ordem | int |
| palavras_chave | text[] | usadas pela captação para classificar notícia por cidade |

### 4.4 `categorias` (editorias)
| campo | tipo |
|---|---|
| portal_id | uuid FK |
| nome | text |
| slug | text |
| pai_id | uuid FK categorias (null) | submenus (ex.: Notícias > Brasil) |
| exibir_menu | boolean |
| exibir_home | boolean | gera bloco na home |
| ordem_menu | int |
| ordem_home | int |
| cor | text |
| palavras_chave | text[] | usadas pela captação |

### 4.5 `materias`
| campo | tipo | obs |
|---|---|---|
| portal_id | uuid FK | |
| autor_id | uuid FK profiles (null) | null quando origem = captacao |
| coluna_id | uuid FK colunas (null) | preenchido se for artigo de coluna |
| categoria_id | uuid FK | |
| cidade_id | uuid FK (null) | |
| titulo | text | |
| slug | text | unique por portal |
| subtitulo | text | |
| resumo | text | |
| conteudo | jsonb | JSON do Tiptap |
| conteudo_html | text | HTML renderizado/sanitizado |
| imagem_url | text | |
| imagem_credito | text | |
| origem | enum (manual, captacao) | |
| fonte_id | uuid FK fontes_rss (null) | |
| fonte_nome | text | ex.: "G1" |
| url_original | text | link para a fonte |
| url_original_hash | text unique | dedupe (sha256 da URL normalizada) |
| status | enum (rascunho, publicado, despublicado, agendado) | |
| publicado_em | timestamptz | |
| urgente | boolean | barra "Urgente" |
| destaque | boolean | bloco de destaques da home |
| tags | text[] | |
| visualizacoes | int default 0 | "Mais lidas" |
| seo_titulo | text | |
| seo_descricao | text | |

Índices: `(portal_id, status, publicado_em desc)`, `(categoria_id, publicado_em desc)`, `(cidade_id, publicado_em desc)`, `(coluna_id)`, `(autor_id)`, full-text search em `titulo` + `resumo` (tsvector português).

### 4.6 `colunas`
| campo | tipo | obs |
|---|---|---|
| portal_id | uuid FK | |
| dono_id | uuid FK profiles | colunista |
| cidade_id | uuid FK | coluna de cidade |
| nome | text | |
| slug | text unique por portal | `/coluna/[slug]` |
| descricao | text | |
| capa_url | text | |
| status | enum (pendente, ativa, suspensa) | admin aprova |
| aceita_anuncios | boolean | |

### 4.7 `fontes_rss`
| campo | tipo | obs |
|---|---|---|
| portal_id | uuid FK | |
| nome | text | "G1 - Política" |
| veiculo | text | "G1" |
| url_feed | text | |
| categoria_padrao_id | uuid FK | editoria de destino |
| cidade_padrao_id | uuid FK (null) | |
| ativo | boolean | |
| intervalo_minutos | int default 15 | |
| max_itens_por_execucao | int default 20 | |
| publicar_automatico | boolean default true | |
| ultima_execucao | timestamptz | |
| ultimo_status | text | ok / erro |
| ultimo_erro | text | |
| total_importadas | int default 0 | |

### 4.8 `captacao_logs`
| campo | tipo |
|---|---|
| fonte_id | uuid FK |
| iniciado_em | timestamptz |
| finalizado_em | timestamptz |
| itens_lidos | int |
| itens_novos | int |
| itens_duplicados | int |
| status | text |
| erro | text |

### 4.9 `espacos_anuncio` (slots)
| campo | tipo | obs |
|---|---|---|
| portal_id | uuid FK | |
| dono_tipo | enum (plataforma, coluna) | |
| coluna_id | uuid FK (null) | quando dono_tipo = coluna |
| formato_id | uuid FK formatos_anuncio | |
| nome | text | "Topo da coluna Cotia em Foco" |
| preco_mensal | numeric(10,2) | definido pelo colunista (ou admin) |
| preco_semanal | numeric(10,2) null | |
| ativo | boolean | |

### 4.10 `formatos_anuncio` (definidos pelo admin)
| campo | tipo | obs |
|---|---|---|
| nome | text | "Super banner topo" |
| posicao | enum (topo, lateral, meio_texto, rodape, home_entre_blocos) | |
| largura | int | px |
| altura | int | px |
| largura_mobile | int | |
| altura_mobile | int | |
| preco_minimo | numeric(10,2) | piso definido pelo admin |

### 4.11 `anunciantes`
| campo | tipo | obs |
|---|---|---|
| portal_id | uuid FK | |
| cadastrado_por | uuid FK profiles | colunista ou admin dono |
| usuario_id | uuid FK profiles (null) | se o anunciante tiver login |
| nome | text | |
| cpf_cnpj | text | |
| email | text | |
| telefone | text | |

### 4.12 `anuncios`
| campo | tipo | obs |
|---|---|---|
| espaco_id | uuid FK | |
| anunciante_id | uuid FK | |
| dono_id | uuid FK profiles | dono do espaço (colunista/admin) — usado no RLS |
| titulo | text | interno |
| imagem_desktop_url | text | |
| imagem_mobile_url | text | |
| link_destino | text | |
| inicio_em | date | |
| fim_em | date | |
| status | enum (aguardando_pagamento, ativo, pausado, expirado, cancelado) | |
| valor | numeric(10,2) | |
| impressoes | int default 0 | |
| cliques | int default 0 | |

Regra: um espaço não pode ter dois anúncios `ativo` com períodos sobrepostos (constraint de exclusão com `daterange` ou validação no servidor). Opcional: rotação de N anúncios por espaço (configurável no formato).

### 4.13 `pedidos` (cobranças)
| campo | tipo | obs |
|---|---|---|
| anuncio_id | uuid FK | |
| dono_id | uuid FK profiles | |
| valor_total | numeric(10,2) | |
| comissao_percentual | numeric(5,2) | snapshot da comissão vigente |
| valor_comissao | numeric(10,2) | |
| valor_liquido_dono | numeric(10,2) | |
| forma_pagamento | enum (pix, boleto, cartao, manual) | |
| asaas_payment_id | text | |
| link_pagamento | text | |
| status | enum (pendente, pago, vencido, cancelado, estornado) | |
| pago_em | timestamptz | |

### 4.14 `metricas_anuncio_diarias`
| campo | tipo |
|---|---|
| anuncio_id | uuid FK |
| data | date |
| impressoes | int |
| cliques | int |
PK composta `(anuncio_id, data)`. Incremento via função SQL `incrementar_metrica(anuncio_id, tipo)` (security definer).

### 4.15 `configuracoes` (chave/valor por portal)
Ex.: `comissao_padrao_percentual`, `autocadastro_colunista`, `aprovar_colunas_manual`, `captacao_ativa_global`.

### 4.16 `shorts` / `videos`
| campo | tipo |
|---|---|
| portal_id | uuid FK |
| youtube_id | text |
| titulo | text |
| ordem | int |
| ativo | boolean |

### 4.17 `auditoria`
Registro de ações sensíveis do admin (bloquear usuário, alterar comissão, excluir conteúdo): `usuario_id`, `acao`, `entidade`, `entidade_id`, `dados jsonb`.

---

## 5. Políticas RLS (resumo obrigatório)

Função auxiliar:
```sql
create or replace function public.current_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid() and status = 'ativo'
$$;
```

| Tabela | SELECT | INSERT/UPDATE/DELETE |
|---|---|---|
| `materias` | Público: `status = 'publicado' and publicado_em <= now()`. Autor: `autor_id = auth.uid()`. Admin: tudo. | Autor: só onde `autor_id = auth.uid()`. Admin: tudo. Captação: service role. |
| `colunas` | Público: `status = 'ativa'`. Dono: `dono_id = auth.uid()`. Admin: tudo. | Dono (colunista): só as próprias. Admin: tudo. |
| `espacos_anuncio` | Dono da coluna + admin. | Dono da coluna (só `dono_tipo = coluna` das próprias colunas). Admin: tudo. |
| `anunciantes` | `cadastrado_por = auth.uid()` ou `usuario_id = auth.uid()`; admin: tudo. | `cadastrado_por = auth.uid()`; admin. |
| `anuncios` | Público: somente via **view/RPC** `anuncios_ativos_publicos` (só campos de exibição). Dono: `dono_id = auth.uid()`. Anunciante: via anunciante.usuario_id. Admin: tudo. | Dono e admin. |
| `pedidos` | Dono e admin. | Somente servidor (service role) e admin. |
| `fontes_rss`, `captacao_logs`, `configuracoes`, `formatos_anuncio`, `auditoria` | Admin (formatos: leitura para colunistas). | Admin. |
| `categorias`, `cidades`, `portais`, `shorts` | Público. | Admin. |
| `profiles` | Público: campos públicos via view `autores_publicos`. Próprio usuário: o seu. Admin: tudo. | Próprio usuário: campos não sensíveis (não pode alterar `role` nem `status`). Admin: tudo. |

**Teste obrigatório**: criar 2 colunistas e 2 editores de teste e provar, por script, que um não lê nem altera dados do outro.

---

## 6. Captação automática de notícias (RSS)

### 6.1 Fluxo
1. Cron chama `POST /api/cron/captacao` a cada 5 min com header `Authorization: Bearer CRON_SECRET`.
2. A rota busca `fontes_rss` ativas cujo `ultima_execucao + intervalo_minutos <= now()`.
3. Para cada fonte (em paralelo com limite de concorrência 5, timeout de 15s por feed):
   - Baixa e parseia o feed com `rss-parser` (suportar RSS 2.0 e Atom; tratar encoding ISO-8859-1).
   - Para cada item (até `max_itens_por_execucao`):
     - Normaliza a URL (remove utm_*, fragmentos) → `sha256` → `url_original_hash`.
     - Se o hash já existe → conta como duplicado e pula.
     - Extrai **somente do feed**: `title`, `contentSnippet`/`description` (limpo de HTML, máximo ~400 caracteres), imagem (`enclosure`, `media:content`, `media:thumbnail` ou primeira `<img>` da description), `pubDate`, `link`, autor se houver.
     - **Classificação**: categoria = `categoria_padrao_id` da fonte; se o título/resumo contiver `palavras_chave` de uma cidade cadastrada → define `cidade_id`; idem para refinar a categoria.
     - Gera `slug` único a partir do título.
     - Insere em `materias` com `origem = 'captacao'`, `status = 'publicado'` (se `publicar_automatico`), `fonte_nome`, `url_original`.
   - Atualiza `ultima_execucao`, `ultimo_status`, `total_importadas` e grava `captacao_logs`.
4. Ao final: `revalidatePath('/')` e das páginas de categoria afetadas.

### 6.2 Exibição de matéria captada
A página `/materia/[slug]` de uma matéria `origem = captacao` mostra: título, data, editoria, imagem do feed (com crédito "Foto: [veículo]"), resumo do feed, selo "Via [veículo]" e botão destacado **"Leia a matéria completa em [veículo]"** (link `url_original`, `target=_blank`, `rel="noopener nofollow"`). Abaixo: anúncios e "matérias relacionadas" do portal (mantém o leitor no site).

### 6.3 Fontes iniciais (seed — validar URLs na implementação)
Cadastrar via seed as fontes com feed RSS público dos principais veículos (G1 por editoria e por região, UOL, Folha, Estadão, CNN Brasil, Metrópoles, R7, Terra, Agência Brasil, BBC News Brasil, InfoMoney, Exame, Canaltech, TecMundo, ge.globo, Lance!). A rota de admin "Testar feed" deve validar cada URL antes de ativar.

### 6.4 Admin de captação
- CRUD de fontes, botão **"Testar feed"** (mostra os 5 primeiros itens sem salvar), botão **"Executar agora"**.
- Liga/desliga global (`captacao_ativa_global`).
- Tela de logs com filtros e status por fonte (verde/vermelho).
- Lista de matérias captadas com ação de despublicar/excluir e editar categoria/cidade.
- Limpeza automática opcional: arquivar matérias captadas com mais de N dias (configurável).

---

## 7. Portal público — páginas e rotas

| Rota | Conteúdo |
|---|---|
| `/` | Home em blocos (ver 7.1) |
| `/materia/[slug]` | Matéria (manual ou captada), compartilhamento social, relacionadas, anúncios |
| `/categoria/[slug]` | Lista paginada da editoria (subcategorias incluídas) |
| `/cidade/[slug]` | Notícias + colunas daquela cidade |
| `/cidades` | Lista de todas as cidades |
| `/colunas` | Todas as colunas ativas, filtro por cidade |
| `/coluna/[slug]` | Página da coluna: capa, colunista, artigos, espaços de anúncio |
| `/autor/[slug]` | Perfil do autor/colunista + matérias |
| `/busca?q=` | Busca full-text |
| `/anuncie` | Página comercial + formulário de contato |
| `/sitemap.xml`, `/robots.txt`, `/rss.xml` | SEO e feed próprio |
| `/login`, `/cadastro`, `/recuperar-senha` | Autenticação |

### 7.1 Blocos da home (ordem padrão, configurável)
1. Barra **"Urgente"** com ticker horizontal (matérias com `urgente = true` ou últimas 12).
2. **Header**: logo, menu de editorias com submenus (dropdown), submenu "Cidades", "+ Mais", busca, data.
3. **Destaques**: 1 grande + 4 menores (`destaque = true`).
4. **Grade de cards** (5 matérias com imagem, autor e data).
5. **As Mais Recentes** + sidebar com **Mais lidas** (top 5 por `visualizacoes` nos últimos 7 dias).
6. **Carrossel "Últimas do portal"**.
7. **Cidades em evidência**.
8. **Shorts** (YouTube).
9. **TV ao vivo** (embed YouTube configurado no portal).
10. **Um bloco por editoria** com `exibir_home = true` (4 matérias + "Ver tudo").
11. **Colunistas** (carrossel de perfis).
12. **Faixa de fontes** ("Nossas fontes diárias") com o nome dos veículos ativos.
13. **Rodapé**: logo, editorias, institucional, redes sociais, copyright.
14. **Espaços de anúncio da plataforma** intercalados (topo, entre blocos, lateral).

### 7.2 Requisitos de front
- Mobile first, layout fiel ao estilo de portal de notícias (cards com imagem, label de editoria colorido, "Por [autor] · data").
- Lighthouse ≥ 90 em performance e SEO no mobile.
- Metadados Open Graph/Twitter por página, JSON-LD `NewsArticle` nas matérias, canonical.
- Contador de visualização via route handler leve (não bloqueia render).
- Componente `<AdSlot posicao="..." colunaId?>` que busca anúncio ativo, registra impressão (IntersectionObserver, 1x por sessão) e clique via `/api/ads/click/[id]` (redireciona ao destino).

---

## 8. Painel (área logada) — `/painel`

Layout com sidebar; menus exibidos conforme o role.

### 8.1 Comum a todos
- Meu perfil (nome, foto, bio, redes, senha).
- Dashboard com números **apenas do próprio conteúdo**.

### 8.2 Editor
- **Minhas matérias**: lista, filtros (status, editoria, cidade), criar/editar com Tiptap (imagens com upload, embed YouTube, citação), campos SEO, agendamento, marcar como urgente/destaque (se permitido pelo admin).
- **Notícias captadas** (somente leitura, filtros por fonte).

### 8.3 Colunista
- **Minhas colunas**: criar coluna (nome, cidade, descrição, capa) → status `pendente` se aprovação manual estiver ligada.
- **Meus artigos**: mesmo editor das matérias, vinculado a uma das suas colunas.
- **Espaços publicitários**: criar espaços nas suas colunas escolhendo formato (dos permitidos pelo admin) e preço (≥ preço mínimo).
- **Anunciantes**: CRUD dos seus anunciantes.
- **Anúncios**: criar anúncio (anunciante, espaço, período, imagens desktop/mobile com validação de dimensão, link). Gera cobrança → link de pagamento (PIX/boleto/cartão) para enviar ao anunciante. Anúncio vira `ativo` automaticamente quando o pagamento é confirmado e está dentro do período.
- **Financeiro**: vendas, comissão da plataforma, valor líquido, status de cada pedido, total do mês.
- **Métricas**: impressões, cliques e CTR por anúncio (gráfico diário).
- **Configuração de recebimento**: CPF/CNPJ e dados para subconta Asaas (wallet).

### 8.4 Anunciante (opcional v1)
- Meus anúncios, status, período, métricas, segunda via de pagamento.

### 8.5 Admin
- **Dashboard geral**: matérias publicadas (hoje/semana), visualizações, receita de anúncios, comissões, status da captação.
- **Usuários**: listar, convidar, aprovar, alterar role, bloquear, redefinir senha.
- **Conteúdo**: todas as matérias e colunas (editar, despublicar, excluir, aprovar colunas).
- **Editorias** e **Cidades**: CRUD, ordem do menu/home (drag-and-drop), palavras-chave.
- **Captação**: tudo do item 6.4.
- **Publicidade**: formatos, espaços da plataforma, todos os anúncios, aprovação de anúncios (opcional), comissão padrão e por colunista.
- **Financeiro**: todos os pedidos, repasses, export CSV.
- **Aparência do portal**: logo, cores, redes sociais, TV ao vivo, shorts, ordem dos blocos da home.
- **Configurações** gerais e **auditoria**.

---

## 9. Pagamentos (Asaas)

- Ambiente **sandbox** primeiro; chave em variável de ambiente.
- Cada colunista tem uma **subconta/wallet** Asaas (`asaas_wallet_id`). Criação da subconta pelo backend quando o colunista preenche os dados de recebimento.
- Ao gerar cobrança de anúncio de coluna: `split` = `valor_liquido_dono` para a wallet do colunista; o restante (comissão) fica na conta principal.
- Anúncios de espaços da plataforma: sem split.
- **Webhook** `POST /api/webhooks/asaas` (validar token): `PAYMENT_CONFIRMED`/`PAYMENT_RECEIVED` → `pedidos.status = pago` → `anuncios.status = ativo` (se o período já começou). `PAYMENT_OVERDUE` → vencido. Idempotência pelo `asaas_payment_id`.
- Cron diário: expirar anúncios com `fim_em < hoje`; ativar anúncios pagos cujo `inicio_em = hoje`; avisar o dono por e-mail 3 dias antes do vencimento.
- Fallback: opção "pagamento manual" (admin marca como pago).

---

## 10. Requisitos não funcionais

- **Segurança**: RLS em 100% das tabelas; sanitização do HTML (DOMPurify/sanitize-html) antes de salvar `conteudo_html`; rate limit nas rotas de login, clique e visualização; uploads validados (tipo e tamanho ≤ 5MB, conversão para WebP).
- **LGPD**: banner de cookies, página de política de privacidade, dados de anunciantes visíveis apenas ao dono.
- **Performance**: imagens otimizadas, paginação por cursor nas listas, índices definidos no item 4.
- **Observabilidade**: logs da captação no banco; erros de API registrados (console estruturado / Sentry opcional).
- **E-mails transacionais**: convite, aprovação de coluna, link de pagamento, anúncio ativado, aviso de vencimento (Resend ou SMTP do Supabase).
- **Variáveis de ambiente** (`.env.example` obrigatório): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `ASAAS_API_KEY`, `ASAAS_ENV`, `ASAAS_WEBHOOK_TOKEN`, `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`.

---

## 11. Estrutura de pastas sugerida

```
/app
  /(public)            → home, materia, categoria, cidade, coluna, autor, busca, anuncie
  /(auth)              → login, cadastro, recuperar-senha
  /painel
    /admin/...         → telas exclusivas do admin
    /editor/...
    /colunista/...
    /anunciante/...
  /api
    /cron/captacao
    /cron/anuncios
    /webhooks/asaas
    /ads/click/[id]
    /ads/impressao
    /views/[id]
  sitemap.ts, robots.ts, rss.xml/route.ts
/components
  /portal  (Header, Ticker, CardMateria, BlocoEditoria, AdSlot, ...)
  /painel  (Sidebar, DataTable, Editor, ...)
  /ui      (shadcn)
/lib
  /supabase (client.ts, server.ts, admin.ts)
  /captacao (parser.ts, normalizar.ts, classificar.ts, executar.ts)
  /asaas    (client.ts, cobrancas.ts, subcontas.ts)
  /auth     (getUser, requireRole)
  /utils    (slug, datas, sanitize)
/supabase
  /migrations (SQL versionado)
  seed.sql
/docs
  PRD.md
  PROGRESSO.md
```

---

## 12. Etapas de entrega e critérios de aceite

| # | Etapa | Pronto quando |
|---|---|---|
| 0 | Setup | Projeto Next.js + Tailwind + shadcn + Supabase conectado, `.env.example`, lint, estrutura de pastas, `docs/PROGRESSO.md` criado. |
| 1 | Banco + RLS | Migrations de todas as tabelas, enums, índices, triggers, funções e políticas RLS; seed com portal, editorias, cidades, formatos e fontes RSS; script de teste de isolamento passando. |
| 2 | Autenticação e perfis | Login, cadastro (pendente), recuperação de senha, middleware protegendo `/painel`, `requireRole`, admin consegue aprovar/bloquear/trocar role. |
| 3 | Portal público | Todas as rotas do item 7 renderizando dados do banco com seed; home com todos os blocos; SEO (metadata, sitemap, robots, JSON-LD); responsivo. |
| 4 | Painel editor + CRUD de matérias | Editor Tiptap com upload; editor só vê as próprias matérias; publicar/agendar revalida o portal. |
| 5 | Captação RSS | Cron funcionando, dedupe, classificação por cidade/editoria, publicação automática, telas de admin (fontes, testar, executar agora, logs). |
| 6 | Colunas e colunistas | Colunista cria coluna e artigos; admin aprova; páginas `/coluna` e `/colunas` no ar; isolamento entre colunistas comprovado. |
| 7 | Anúncios (sem pagamento) | Formatos, espaços, anunciantes, anúncios, `<AdSlot>` exibindo, impressões e cliques contados, métricas no painel. |
| 8 | Pagamentos Asaas | Subconta do colunista, cobrança com split, webhook ativando anúncio, financeiro do colunista e do admin, cron de expiração. |
| 9 | Admin completo | Dashboard, aparência do portal, configurações, auditoria, export CSV. |
| 10 | Polimento e deploy | Lighthouse ≥ 90, testes de RLS, revisão de segurança, deploy na Vercel, cron configurado, domínio, checklist de produção. |
