# Registro de Progresso — Portal Empire

Este documento registra a evolução do projeto etapa por etapa, conforme as diretrizes do PRD (Item 12).

---

## Tabela de Acompanhamento das Etapas

| Etapa | Nome | Status | Data |
|---|---|---|---|
| **0** | **Setup do Projeto** | **Concluída** | 09/10/2026 |
| **1** | **Banco de Dados + RLS + Seed** | **Concluída** | 09/10/2026 |
| **2** | **Autenticação e Perfis** | **Concluída** | 09/10/2026 |
| **3** | **Portal Público** | **Concluída** | 09/10/2026 |
| **4** | **Painel do Editor + CRUD Matérias** | **Concluída** | 09/10/2026 |
| **5** | **Captação RSS Automatizada** | **Concluída** | 09/10/2026 |
| **6** | **Colunas e Colunistas** | **Concluída** | 09/10/2026 |
| **7** | **Marketplace de Anúncios (sem pagamento)** | **Concluída** | 09/10/2026 |
| **8** | **Pagamentos Asaas (Split e Webhook)** | **Concluída** | 09/10/2026 |
| **9** | **Painel Administrativo Completo** | **Concluída** | 09/10/2026 |
| **10** | **Polimento, Otimização e Deploy** | **Concluída** | 09/10/2026 |



---

## Detalhamento por Etapa

### Etapa 0 — Setup do Projeto
- **Status**: Concluída | **Data**: 09/10/2026
- Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui, Supabase e estrutura de pastas criada.

---

### Etapa 1 — Banco de Dados + RLS + Seed
- **Status**: Concluída | **Data**: 09/10/2026
- 17 tabelas, enums, triggers, RPCs, views públicas, storage buckets e RLS 100% ativo com seed inicial.

---

### Etapa 2 — Autenticação e Perfis
- **Status**: Concluída | **Data**: 09/10/2026
- Login, cadastro pendente, recuperação de senha, middleware com 403 e gestão de usuários pelo admin com auditoria.

---

### Etapa 3 — Portal Público
- **Status**: Concluída | **Data**: 09/10/2026
- Home completa com 14 blocos, páginas de matéria, categoria, cidades, colunas, autor, busca, anuncie, SEO e feeds RSS/Sitemap.

---

### Etapa 4 — Painel do Editor + CRUD de Matérias
- **Status**: Concluída
- **Data**: 09/10/2026
- **Resumo**:
  - Implementado Editor rico com **Tiptap** ([`components/painel/tiptap-editor.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/painel/tiptap-editor.tsx)):
    - Formatações: negrito, itálico, tachado, títulos H2/H3, listas ordenadas e com marcadores, citações e links.
    - Upload direto de imagens no editor para o Supabase Storage (`materias/{userId}/...`) com validação de 5MB.
    - Embed integrado de vídeos do YouTube.
  - Formulário completo de matéria ([`components/painel/materia-form.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/painel/materia-form.tsx)):
    - Campos: título (com geração automática e edição de slug), subtítulo, resumo, seleção de editoria e cidade, imagem de capa com upload e créditos, gerenciador de tags, campos de SEO (título e descrição) e flags de urgente e destaque.
    - Status de publicação: `rascunho`, `publicado`, `despublicado` e `agendado` com seletor de data/hora futura.
    - Persistência dupla do conteúdo: `conteudo` (JSON do Tiptap) e `conteudo_html` (sanitizado com `sanitize-html`).
  - Rotas de API com validação Zod e RLS:
    - [`app/api/materias/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/materias/route.ts): Criação de matéria com revalidação automática de cache (`revalidatePath`).
    - [`app/api/materias/[id]/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/materias/[id]/route.ts): Atualização e exclusão com verificação estrita de autor/admin.
    - [`app/api/cron/publicar-agendadas/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/cron/publicar-agendadas/route.ts): Cron job protegido por `CRON_SECRET` para ativação automática de matérias agendadas.
  - DataTable Interativa ([`components/painel/materias-datatable.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/painel/materias-datatable.tsx)):
    - Busca em tempo real por título, resumo ou slug.
    - Filtros por status, editoria e cidade.
    - Ações rápidas: Editar, Ver no Portal, Publicar/Despublicar com 1 clique e Excluir com confirmação.
  - Páginas de Matérias:
    - [`/painel/editor/materias`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/editor/materias/page.tsx): Lista apenas matérias do autor logado (isolamento por RLS).
    - [`/painel/editor/materias/nova`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/editor/materias/nova/page.tsx): Redação e criação.
    - [`/painel/editor/materias/[id]`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/editor/materias/[id]/page.tsx): Edição de matéria existente.
    - [`/painel/admin/materias`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/admin/materias/page.tsx): Visão global para administradores moderarem qualquer matéria do portal.
- **Decisões tomadas**:
  - Toda entrada de HTML é rigorosamente sanitizada no backend via `sanitizeContentHtml` antes de salvar no banco, prevenindo ataques XSS.
  - As revalidações de rota `revalidatePath` são disparadas instantaneamente ao criar, editar, despublicar ou excluir matérias.
- **Pendências**:
  - Nenhuma para a Etapa 4.
- **Como testar**:
  1. Acessar `/painel/editor/materias/nova` e redigir uma nova matéria com título, resumo, imagem de capa e texto com Tiptap.
  2. Publicar a matéria e verificar se ela aparece na Home (`/`) e na página da editoria (`/categoria/...`).
  3. Acessar `/painel/editor/materias` e testar edição, filtros, busca e exclusão.
  4. Testar agendamento selecionando status "Agendar Publicação" e chamando `POST /api/cron/publicar-agendadas` com header `Authorization: Bearer <CRON_SECRET>`.

---

### Etapa 5 — Captação RSS Automatizada
- **Status**: Concluída
- **Data**: 09/10/2026
- **Resumo**:
  - Módulos de captação em `lib/captacao/`:
    - [`lib/captacao/parser.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/lib/captacao/parser.ts): Parser com timeout de 15s, headers customizados, suporte completo a RSS 2.0 e Atom, e decodificação de encoding (UTF-8 e ISO-8859-1).
    - [`lib/captacao/normalizar.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/lib/captacao/normalizar.ts): Limpeza de parâmetros de rastreamento (UTMs, `fbclid`, `gclid`, fragmentos), cálculo de hash SHA-256 (`url_original_hash`) para deduplicação, sanitização de HTML do resumo limitando a ~400 caracteres sem cortar palavras, e extração prioritária de imagens (`enclosure`, `media:content`, `media:thumbnail` ou `<img>` na description).
    - [`lib/captacao/classificar.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/lib/captacao/classificar.ts): Classificação automática de cidades e editorias com base em palavras-chave cadastradas e regras de pontuação com limites de palavra.
    - [`lib/captacao/executar.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/lib/captacao/executar.ts): Orquestração de feeds com limite de concorrência de 5 feeds simultâneos, deduplicação por hash, inserção como publicado quando `publicar_automatico = true`, auditoria em `captacao_logs`, arquivamento automático configurável por dias e revalidação instantânea de cache da Home, Editorias e Cidades afetadas.
  - Endpoints de API:
    - [`app/api/cron/captacao/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/cron/captacao/route.ts): Rota `POST` protegida por `CRON_SECRET` chamada periodicamente pelo Vercel Cron.
    - [`app/api/admin/captacao/testar/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/admin/captacao/testar/route.ts): Rota `POST` para pré-visualização de 5 itens de qualquer feed sem persistir no banco.
    - [`app/api/admin/captacao/executar/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/admin/captacao/executar/route.ts): Rota `POST` para disparo manual de captação de fontes específicas ou globais.
    - [`app/api/admin/captacao/fontes/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/admin/captacao/fontes/route.ts) e `[id]`: CRUD completo de fontes RSS.
    - [`app/api/admin/captacao/logs/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/admin/captacao/logs/route.ts): Consulta de histórico de execuções com filtros.
    - [`app/api/admin/captacao/config/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/admin/captacao/config/route.ts): Controle global liga/desliga (`captacao_ativa_global`) e dias de arquivamento (`captacao_arquivar_dias`).
    - [`app/api/admin/captacao/materias/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/admin/captacao/materias/route.ts) e `[id]`: Gerenciamento de notícias captadas (alterar editoria/cidade, publicar/despublicar e excluir).
  - Painel de Administração de Captação:
    - Página [`/painel/admin/captacao`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/admin/captacao/page.tsx) com abas: Fontes RSS, Matérias Captadas, Logs de Execução e Configurações & Documentação Cron.
    - Modais: [`TestarFeedDialog`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/painel/captacao/testar-feed-dialog.tsx), [`FonteFormDialog`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/painel/captacao/fonte-form-dialog.tsx) e [`EditarMateriaCaptadaDialog`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/painel/captacao/editar-materia-captada-dialog.tsx).
  - Agendamento:
    - [`vercel.json`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/vercel.json) configurado para executar `/api/cron/captacao` a cada 5 minutos (`*/5 * * * *`).
    - Documentada no painel e no PRD a alternativa com Supabase `pg_cron` + `pg_net`.
  - **Validação das Fontes do Seed (`npm run test:fontes`)**:
    - **13 Fontes Válidas e Ativas**:
      1. G1 - Notícias Gerais (100 itens)
      2. G1 - Política (100 itens)
      3. G1 - Economia (100 itens)
      4. Folha de S.Paulo - Poder (100 itens)
      5. CNN Brasil - Geral (60 itens)
      6. Metrópoles - Brasil (20 itens)
      7. Agência Brasil - Últimas (10 itens)
      8. BBC News Brasil (27 itens)
      9. InfoMoney - Mercados (10 itens)
      10. Exame - Negócios (25 itens)
      11. Canaltech (50 itens)
      12. TecMundo (50 itens)
      13. ge.globo - Esportes (100 itens)
    - **5 Fontes com Erro no Servidor de Origem (Marcadas como `ativo: false` no seed)**:
      1. UOL - Notícias: Formato XML incompatível
      2. Estadão - Política: HTTP 404 Not Found
      3. R7 - Notícias: HTTP 404 Not Found
      4. Terra - Notícias: HTTP 404 Not Found
      5. Lance! - Futebol: HTTP 410 Gone
- **Decisões tomadas**:
  - Respeito estrito à diretriz de **Zero Scraping**: todo o conteúdo captado provém exclusivamente dos nós do feed RSS/Atom, atribuindo créditos ao veículo com selo e link destacado `rel="noopener nofollow"`.
  - Concorrência máxima controlada em 5 feeds paralelos para evitar sobrecarga de rede e respeitar limites de recursos.
  - Arquivamento automático opcional integrado na rotina do cron com base na chave `captacao_arquivar_dias`.
- **Como testar**:
  1. `npm run test:captacao`: Executa a suíte de testes unitários e de integração.
  2. `npm run test:fontes`: Testa ao vivo todas as URLs de feeds RSS do seed.
  3. Acessar `/painel/admin/captacao`:
     - Testar qualquer feed colando a URL no botão "Testar Feed".
     - Clicar em "Executar Agora" para coletar notícias em tempo real.
     - Ver a aba "Matérias Captadas" e editar categoria/cidade ou publicar/despublicar.
     - Ver a aba "Logs de Execução" com detalhes de lidos/novos/duplicados.
  4. Testar o endpoint cron via requisição: `POST /api/cron/captacao` com header `Authorization: Bearer <CRON_SECRET>`.

---

### Etapa 6 — Colunas e Colunistas
- **Status**: Concluída
- **Data**: 09/10/2026
- **Resumo**:
  - Painel do Colunista:
    - [`/painel/colunista/dashboard`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/colunista/dashboard/page.tsx): Visão geral com contadores de colunas criadas, artigos publicados e total de visualizações acumuladas.
    - [`/painel/colunista/colunas`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/colunista/colunas/page.tsx): Gestão de colunas do colunista com badges de status (`ativa`, `pendente`, `suspensa`), upload de capa para o bucket `colunas/{userId}/...`, indicação de status pendente caso `aprovar_colunas_manual = true` nas configurações globais.
    - [`/painel/colunista/artigos`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/colunista/artigos/page.tsx): DataTable com todos os artigos vinculados às colunas do autor logado.
    - [`/painel/colunista/artigos/novo`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/colunista/artigos/novo/page.tsx): Redação de novos artigos com o editor rico Tiptap da etapa 4, com o campo de coluna obrigatório selecionando exclusivamente entre as colunas **ativas** do colunista.
  - Painel Administrativo de Colunas:
    - [`/painel/admin/colunas`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/admin/colunas/page.tsx): Visualização global de todas as colunas com aprovação em 1 clique (`status = 'ativa'`), suspensão (`status = 'suspensa'`), edição, exclusão e filtros por status e cidade.
  - Endpoints de API:
    - [`app/api/colunas/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/colunas/route.ts): `GET` (lista colunas filtradas por permissão) e `POST` (cria coluna com status condicionado à regra `aprovar_colunas_manual`).
    - [`app/api/colunas/[id]/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/colunas/%5Bid%5D/route.ts): `GET`, `PUT` e `DELETE` protegidos por autor e admin.
    - [`app/api/admin/colunas/[id]/status/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/admin/colunas/%5Bid%5D/status/route.ts): `PATCH` administrativo para alteração rápida de status de colunas com revalidação de rotas.
  - Páginas Públicas Integradas:
    - [`/colunas`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/%28public%29/colunas/page.tsx): Lista de todas as colunas ativas com filtro por cidade.
    - [`/coluna/[slug]`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/%28public%29/coluna/%5Bslug%5D/page.tsx): Página dedicada da coluna com capa, foto/bio do colunista, artigos paginados e slots de anúncios integrados.
    - [`/cidade/[slug]`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/%28public%29/cidade/%5Bslug%5D/page.tsx): Exibe carrossel com as colunas municipais da respectiva cidade.
    - Bloco "Nossos Colunistas" na Home (`/`): Lê colunistas com colunas ativas via [`components/portal/ColunistasCarrossel.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/portal/ColunistasCarrossel.tsx).
  - Testes de RLS Expandidos:
    - [`scripts/testar-rls.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/scripts/testar-rls.ts) atualizado com 16 asserções rigorosas cobrindo isolamento entre colunistas.
- **Decisões tomadas**:
  - A criação de colunas por colunistas respeita estritamente o valor de `configuracoes.aprovar_colunas_manual`. Se ativado, a coluna entra como `pendente` e aguarda a moderação do admin.
  - O editor de artigos do colunista bloqueia a publicação caso o colunista não possua nenhuma coluna ativa/aprovada.
- **Como testar**:
  1. `npm run test:rls`: Executa o teste automatizado de RLS.
  2. Login como Colunista:
     - Acessar `/painel/colunista/colunas` e criar uma nova coluna.
     - Acessar `/painel/colunista/artigos/novo` e redigir um artigo vinculado à coluna ativa.
  3. Login como Admin:
     - Acessar `/painel/admin/colunas` para aprovar, suspender ou editar qualquer coluna.
  4. Portal público:
     - Acessar `/colunas`, `/coluna/[slug]`, `/cidade/[slug]` e a Home para verificar a exibição em tempo real.

---

### Etapa 7 — Marketplace de Anúncios (Publicidade & Métricas)
- **Status**: Concluída
- **Data**: 09/10/2026
- **Resumo**:
  - **Admin > Publicidade & Formatos** ([`/painel/admin/anuncios`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/admin/anuncios/page.tsx)):
    - Painel com abas para gestão centralizada de:
      1. **Todos os Anúncios**: Lista com busca, performance (impressões, cliques, CTR), datas de veiculação, status e ações de ativação/pausa e modal de métricas diárias.
      2. **Espaços da Plataforma**: Criação e edição de espaços publicitários globais ou associados a colunas.
      3. **Formatos de Anúncio**: CRUD completo de formatos com dimensões em pixels (desktop e mobile), posição padrão e preço base mínimo obrigatório.
  - **Colunista > Espaços** ([`/painel/colunista/espacos`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/colunista/espacos/page.tsx)):
    - Criação e edição de espaços publicitários exclusivos para suas próprias colunas ativas.
    - Validação em tempo real: o preço mensal cadastrado pelo colunista deve ser $\ge$ ao `preco_minimo` do formato selecionado.
  - **Colunista > Anunciantes** ([`/painel/colunista/anunciantes`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/colunista/anunciantes/page.tsx)):
    - CRUD completo de clientes anunciantes (nome do contato, empresa, e-mail, telefone/WhatsApp e CPF/CNPJ). Isolamento estrito de dados por colunista via RLS.
  - **Colunista > Anúncios** ([`/painel/colunista/anuncios`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/colunista/anuncios/page.tsx)):
    - Criação de anúncio com seleção de anunciante, espaço disponível, link de destino com validação de URL, período de veiculação e upload das artes desktop e mobile direto no bucket `anuncios/{userId}/...`.
    - **Bloqueio de sobreposição de datas**: A API rejeita a criação de anúncios com períodos conflitantes no mesmo espaço publicitário.
    - Ativação manual ou agendada com suporte a pausa/retomada.
  - **Componente `<AdSlot>` Público** ([`components/portal/AdSlot.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/portal/AdSlot.tsx)):
    - Consulta anúncios ativos para a posição e/ou coluna informada através de [`/api/ads/slot`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/ads/slot/route.ts).
    - Renderização responsiva com imagens otimizadas para desktop e mobile.
    - Contagem de impressões com `IntersectionObserver` disparada apenas quando o anúncio atinge 50% de visibilidade na tela, deduplicada por sessão (`sessionStorage`) via [`/api/ads/impressao`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/ads/impressao/route.ts) com rate limit por IP.
    - Redirecionamento e contagem de cliques via rota segura [`/api/ads/click/[id]`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/ads/click/%5Bid%5D/route.ts) (HTTP 302 com `rel="noopener nofollow"`).
    - Fallback elegante "Anuncie aqui" direcionando para a página [`/anuncie`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/%28public%29/anuncie/page.tsx) com parâmetros de contexto pré-preenchidos.
  - **Métricas e Relatórios** ([`components/painel/anuncios/metricas-dialog.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/painel/anuncios/metricas-dialog.tsx)):
    - Endpoint [`/api/anuncios/[id]/metricas`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/anuncios/%5Bid%5D/metricas/route.ts) que retorna totais de impressões, cliques, CTR consolidado e histórico diário dos últimos 30 dias a partir da tabela `metricas_anuncio_diarias`.
    - Acesso protegido por RLS: visualizado apenas pelo proprietário do anúncio, pelo anunciante vinculado ou pelo administrador.
  - **Cron Diário de Publicidade** ([`app/api/cron/anuncios/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/cron/anuncios/route.ts)):
    - Rota protegida por `CRON_SECRET` executada diariamente à meia-noite (`5 0 * * *` configurada no [`vercel.json`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/vercel.json)).
    - Expira automaticamente anúncios com `fim_em < hoje` (status `expirado`) e ativa anúncios agendados com `inicio_em <= hoje` (status `ativo`).
- **Decisões tomadas**:
  - A atomicidade e integridade das métricas é garantida pela função SQL Security Definer `incrementar_metrica(p_anuncio_id, p_tipo)`, que simultaneamente incrementa o contador consolidado em `anuncios` e faz o `UPSERT` na tabela `metricas_anuncio_diarias` indexada por `(anuncio_id, data)`.
  - Rate limiting duplo em impressões: no frontend (1x por sessão por anúncio com `sessionStorage`) e no backend (janela de 30 segundos por IP).
- **Como testar**:
  1. Acessar `/painel/admin/anuncios` e criar formatos de anúncio e espaços da plataforma.
  2. Acessar `/painel/colunista/anunciantes` e cadastrar um novo anunciante.
  3. Acessar `/painel/colunista/espacos` e cadastrar um espaço publicitário para sua coluna.
  4. Acessar `/painel/colunista/anuncios` e cadastrar um anúncio com artes desktop e mobile, link de destino e período.
  5. Acessar a página da coluna (`/coluna/[slug]`) ou matéria e verificar a renderização do anúncio no slot correto.
  6. Rolar até o anúncio e clicar nele: verificar no painel o incremento das impressões, cliques e cálculo de CTR.
  7. Testar o cron de expiração: `POST /api/cron/anuncios` com header `Authorization: Bearer <CRON_SECRET>`.
- **Critérios de aceite atendidos**:
  - [x] Admin gerencia formatos (dimensões desktop/mobile, posição, preço mínimo), espaços da plataforma e lista global de anúncios.
  - [x] Colunista cria espaços em suas próprias colunas respeitando o preço mínimo do formato.
  - [x] Colunista realiza CRUD dos próprios anunciantes com isolamento total de outros usuários.
  - [x] Colunista cria anúncio com upload de imagem desktop/mobile, link e período, com bloqueio de sobreposição de datas no mesmo espaço.
  - [x] `<AdSlot>` busca anúncio ativo via API/view pública, renderiza imagem por breakpoint, registra impressão única por sessão via IntersectionObserver e registra clique via redirecionamento.
  - [x] Fallback "Anuncie aqui" linkando para `/anuncie` quando o slot não possui anúncio ativo.
  - [x] Rate limit implementado nas rotas de impressão e clique.
  - [x] Modal de métricas com histórico diário de impressões, cliques e CTR.
  - [x] Cron `/api/cron/anuncios` configurado e funcionando para expirar vencidos e ativar iniciados.
  - [x] `npm run lint` e `npm run build` passando com 0 erros (52 rotas compiladas com sucesso).

---

### Etapa 8 — Pagamentos Asaas (Split e Webhooks)
- **Status**: Concluída
- **Data**: 09/10/2026
- **Resumo**:
  - **Módulos Asaas em `lib/asaas/`**:
    - [`lib/asaas/client.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/lib/asaas/client.ts): Cliente HTTP tipado com suporte a Sandbox (`https://sandbox.asaas.com/api/v3`) e Produção, autenticação por `access_token` e modo de mock para testes locais.
    - [`lib/asaas/subcontas.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/lib/asaas/subcontas.ts): Criação de subcontas Asaas para colunistas (`POST /accounts`) com extração de `walletId` para repasses.
    - [`lib/asaas/cobrancas.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/lib/asaas/cobrancas.ts): Criação de clientes (`POST /customers`), faturas com **Split de Pagamento** para a carteira do colunista (`fixedValue` calculado com base no valor líquido) e obtenção de QR Code / código copia-e-cola PIX (`GET /payments/{id}/pixQrCode`).
  - **Serviço de Notificações por E-mail** ([`lib/email/servico.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/lib/email/servico.ts)):
    - Envio de fatura e link de pagamento para o anunciante.
    - Confirmação de pagamento e anúncio ativado no ar.
    - Alerta prévio de vencimento de campanha (3 dias antes do término).
  - **Fluxo do Colunista & Recebimento**:
    - [`/painel/colunista/financeiro`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/colunista/financeiro/page.tsx): Painel financeiro com totais de vendas brutas, comissão da plataforma, valor líquido a receber e status de integração da subconta Asaas.
    - Modal de configuração de subconta ([`SubcontaConfigDialog`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/painel/financeiro/subconta-config-dialog.tsx)) conectado à rota `POST /api/colunista/subconta`.
  - **Criação de Anúncios com Cobrança & Compartilhamento**:
    - Ao cadastrar anúncio ([`app/api/anuncios/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/anuncios/route.ts)), calcula comissão padrão (`comissao_padrao_percentual` de `configuracoes`) e valor líquido.
    - Gera registro na tabela `pedidos`.
    - Modal pós-criação exibe QR Code PIX, código Copia e Cola, link da fatura e botão **"Enviar por WhatsApp"** com texto pronto para cobrança direta do cliente.
  - **Webhook Asaas Automatizado** ([`app/api/webhooks/asaas/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/webhooks/asaas/route.ts)):
    - Validação de segurança via header `asaas-access-token`.
    - Idempotência por `asaas_payment_id`.
    - Eventos `PAYMENT_RECEIVED` e `PAYMENT_CONFIRMED`: Marca pedido como `pago`, ativa anúncio automaticamente (`status = 'ativo'` ou `agendado` conforme as datas), envia e-mail de confirmação e invalida caches.
    - Eventos `PAYMENT_OVERDUE` e `PAYMENT_REFUNDED`: Atualiza status do pedido e cancela/pausa o anúncio correspondente.
  - **Financeiro Global do Admin** ([`/painel/admin/financeiro`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/admin/financeiro/page.tsx)):
    - Cards com Faturamento Bruto, Comissão Retida, Total Repassado aos Colunistas e Transações Pendentes.
    - Tabela completa de pedidos com filtros de status e busca.
    - **Exportação CSV**: Download de relatório financeiro completo com 1 clique.
    - **Pagamento Manual**: Botão para confirmação manual de pagamentos diretos via `POST /api/pedidos/[id]/confirmar-manual`.
  - **Cron de Publicidade** ([`app/api/cron/anuncios/route.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/cron/anuncios/route.ts)):
    - Ativa anúncios iniciados, expira os vencidos e envia e-mails de renovação 3 dias antes do término.
  - **Suíte de Testes Automatizados** ([`scripts/testar-pagamentos-asaas.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/scripts/testar-pagamentos-asaas.ts)):
    - Script `npm run test:asaas` com 10 asserções validando criação de subconta, geração de cobrança com split, integridade matemática de comissão e PIX QR Code.
- **Decisões tomadas**:
  - A comissão padrão da plataforma (default 20%) é lida dinamicamente da tabela `configuracoes` e gravada como snapshot imutável em `pedidos` para garantir auditoria financeira histórica.
  - A opção de pagamento manual foi preservada tanto para administradores quanto para acordos presenciais/diretos.
- **Como testar**:
  1. `npm run test:asaas`: Executa os testes automatizados do gateway e regras de split.
  2. Acessar `/painel/colunista/financeiro` e preencher os dados de recebimento para gerar a carteira Asaas.
  3. Acessar `/painel/colunista/anuncios`, criar um anúncio com forma de pagamento PIX e verificar a tela de cobrança gerada com QR Code e botão de WhatsApp.
  4. Simular o pagamento chamando o webhook `POST /api/webhooks/asaas` com o evento `PAYMENT_RECEIVED`: verificar a ativação instantânea do anúncio e a marcação do pedido como pago.
  5. Acessar `/painel/admin/financeiro` para conferir métricas globais, exportar relatório CSV ou confirmar pagamentos manuais.
- **Critérios de aceite atendidos**:
  - [x] Criação de subconta Asaas para colunistas com persistência do `asaas_wallet_id`.
  - [x] Cobrança gerada com Split automático para a carteira do colunista e cálculo de comissão da plataforma.
  - [x] Modal de sucesso com QR Code PIX, link da fatura e botão de envio por WhatsApp.
  - [x] Webhook `/api/webhooks/asaas` processando pagamentos de forma idempotente e ativando anúncios automaticamente.
  - [x] Painel financeiro do colunista e painel global do administrador com exportação CSV e confirmação manual.
  - [x] E-mails de fatura, ativação e aviso prévio de vencimento (3 dias).
  - [x] `npm run test:asaas` e `npm run build` passando com 0 erros (56 rotas compiladas).

---

### Etapa 9 — Painel Administrativo Completo
- **Status**: Concluída
- **Data**: 09/10/2026
- **Resumo**:
  - **Dashboard do Administrador** ([`/painel/admin/dashboard`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/admin/dashboard/page.tsx) e [`components/painel/admin/dashboard-view.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/painel/admin/dashboard-view.tsx)):
    - Cards de KPIs globais em tempo real via [`/api/admin/dashboard`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/api/admin/dashboard/route.ts): Matérias hoje/semana, visualizações totais acumuladas, faturamento bruto do mês, comissão retida pelo portal, repasse líquido aos colunistas e total de pedidos pagos.
    - Status do Crawler de Captação RSS: total de fontes, fontes ativas, total de matérias importadas e dados da última execução com status de sucesso/erro.
    - Top 5 Matérias mais lidas com visualizações, data e categoria.
    - Resumo de publicidade com anúncios ativos, aguardando pagamento, impressões e cliques.
    - Resumo da equipe por role (Admin, Editor, Colunista, Anunciante) com alerta de usuários pendentes.
  - **Aparência do Portal & Ordem da Home** ([`/painel/admin/aparencia`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/admin/aparencia/page.tsx) e [`components/painel/admin/aparencia-view.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/painel/admin/aparencia-view.tsx)):
    - Customização de nome do portal, domínio e upload/URL de logomarca com pré-visualização.
    - Color Picker e seletor de paletas com injeção dinâmica de CSS variables no Layout Público (`--primary` e `--ring`).
    - Links de redes sociais (Instagram, Facebook, YouTube, X/Twitter, WhatsApp).
    - URL de transmissão da TV ao vivo (Embed de YouTube Live).
    - **Reordenação dos Blocos da Home**: Permite ao administrador alterar a ordem de exibição dos 9 blocos principais da Home via botões de subir/descer, salvando em `configuracoes` (`ordem_blocos_home`) e refletindo instantaneamente no portal público sem mexer em código.
    - **Reordenação e Visibilidade das Editorias na Home**: Permite reordenar as seções temáticas e alternar quais editorias devem ser exibidas como blocos na Home.
    - **CRUD de Shorts**: Gerenciamento de vídeos verticais curtos do YouTube com título, URL/ID e ordenação.
  - **Editorias (Categorias)** ([`/painel/admin/editorias`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/admin/editorias/page.tsx) e [`components/painel/admin/editorias-view.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/painel/admin/editorias-view.tsx)):
    - CRUD completo com hierarquia pai/filha, cor da editoria, contagem de matérias, flags de menu/home e palavras-chave para classificação automática de feeds RSS.
  - **Cidades** ([`/painel/admin/cidades`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/admin/cidades/page.tsx) e [`components/painel/admin/cidades-view.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/painel/admin/cidades-view.tsx)):
    - CRUD completo com UF, ordem, destaque na barra superior, contagem de colunas/matérias e palavras-chave para classificação automática de cidades no RSS.
  - **Configurações Gerais** ([`/painel/admin/configuracoes`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/admin/configuracoes/page.tsx) e [`components/painel/admin/configuracoes-view.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/painel/admin/configuracoes-view.tsx)):
    - Parâmetros globais: `comissao_padrao_percentual`, `autocadastro_colunista`, `aprovar_colunas_manual`, `captacao_ativa_global` (master switch) e `captacao_arquivar_dias`.
  - **Trilha de Auditoria** ([`/painel/admin/auditoria`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/admin/auditoria/page.tsx) e [`components/painel/admin/auditoria-view.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/painel/admin/auditoria-view.tsx)):
    - Histórico detalhado de ações com filtros por busca, data início, data fim, paginação e modal visualizador do payload JSON.
  - **Dashboard do Editor e do Colunista**:
    - [`/painel/editor/dashboard`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/editor/dashboard/page.tsx): Painel exclusivo do editor com métricas de produção hoje, semana, visualizações acumuladas e top matérias do próprio editor.
    - [`/painel/colunista/dashboard`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/colunista/dashboard/page.tsx): Painel do colunista com colunas, artigos e visualizações.
    - Redirecionamentos no index do painel ([`app/painel/page.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/painel/page.tsx)) direcionando cada perfil para seu dashboard respectivo.
- **Decisões tomadas**:
  - Toda alteração administrativa grava registros auditáveis na tabela `auditoria` através do helper central [`lib/auditoria/log.ts`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/lib/auditoria/log.ts).
  - A Home pública ([`app/(public)/page.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/%28public%29/page.tsx)) renderiza seus blocos dinamicamente mapeados através de `getOrdemBlocosHome()`, permitindo reordenação sem nenhuma alteração de código.
- **Como testar**:
  1. Acessar `/painel/admin/dashboard` e verificar todas as métricas agregadas.
  2. Acessar `/painel/admin/aparencia` e alterar a cor primária, links de redes sociais, URL da TV ao vivo ou a ordem dos blocos da Home.
  3. Acessar o portal público (`/`) e confirmar que a nova cor e a nova ordem dos blocos já estão ativas.
  4. Acessar `/painel/admin/editorias` e `/painel/admin/cidades` para criar/editar editorias e cidades com palavras-chave de RSS.
  5. Acessar `/painel/admin/configuracoes` e atualizar parâmetros de comissão e autocadastro.
  6. Acessar `/painel/admin/auditoria` para consultar o histórico completo de alterações registradas.
  7. Logar como editor e acessar `/painel/editor/dashboard` para visualizar as métricas restritas ao próprio conteúdo.
- **Critérios de aceite atendidos**:
  - [x] Dashboard admin com matérias hoje/semana, visualizações, top matérias, status da captação, receita do mês, comissões e anúncios ativos.
  - [x] Aparência do portal com logo, cor primária, redes sociais, URL da TV ao vivo, CRUD de shorts e reordenação dos blocos da home e das editorias.
  - [x] Editorias e Cidades com CRUD completo, palavras-chave e ordenação.
  - [x] Configurações gerais (comissão padrão, autocadastro, aprovação manual de colunas, captação global, dias para arquivar captadas).
  - [x] Tela de auditoria com filtros avançados e visualizador de JSON.
  - [x] Dashboards de editor e de colunista com números restritos ao próprio conteúdo.
  - [x] O admin consegue mudar a aparência e a ordem da home sem mexer em código.
  - [x] `npm run build` compilando 71 rotas com 0 erros.

---

### Etapa 10 — Polimento, Otimização e Deploy
- **Status**: Concluída
- **Data**: 09/10/2026
- **Resumo**:
  - **Revisão Integral de Segurança**:
    - RLS ativado e validado em 100% das 17 tabelas do banco de dados.
    - Auditoria de código client: a Service Role (`SUPABASE_SERVICE_ROLE_KEY`) é utilizada estritamente via `lib/supabase/admin.ts` protegido por `import "server-only"`, sem vazamentos para o client bundle.
    - Validação com esquemas Zod em 100% dos route handlers de mutação (`POST`, `PUT`, `DELETE`, `PATCH`).
    - Sanitização de HTML com `sanitize-html` em todos os conteúdos de matérias e artigos jornalísticos.
    - Rate limits ativos em rotas de contagem de impressões (`/api/ads/impressao`), cliques (`/api/ads/click/[id]`) e visualizações (`/api/views/[id]`).
  - **Conformidade LGPD & Aspectos Legais**:
    - Banner de consentimento de cookies ([`components/portal/CookieBanner.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/portal/CookieBanner.tsx)) com opções de "Aceitar Todos", "Apenas Necessários", personalização por categoria (Essenciais, Métricas, Publicidade) e persistência em `localStorage`.
    - Página de Política de Privacidade ([`app/(public)/privacidade/page.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/%28public%29/privacidade/page.tsx)) em total conformidade com a LGPD (Lei nº 13.709/2018).
    - Página de Termos de Uso ([`app/(public)/termos/page.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/%28public%29/termos/page.tsx)) com diretrizes editoriais, regras de publicidade e termos para colunistas.
    - Links institucionais integrados ao rodapé global ([`components/portal/Footer.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/components/portal/Footer.tsx)).
  - **Páginas de Erro Personalizadas**:
    - Página 404 ([`app/not-found.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/not-found.tsx)): Design refinado com busca de resgate e links rápidos.
    - Página 500 ([`app/error.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/error.tsx) e [`app/global-error.tsx`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/app/global-error.tsx)): Error boundaries estilizados com botão de retry.
  - **Documentação de Engenharia e Operação**:
    - [`docs/DEPLOY.md`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/docs/DEPLOY.md): Guia passo a passo completo de implantação em produção (Vercel, Supabase, Asaas, Resend, DNS, Crons e SSL).
    - [`docs/MANUAL.md`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/docs/MANUAL.md): Manual completo de uso dos painéis para Administrador, Editor, Colunista e Anunciante.
  - **Compilação e Qualidade**:
    - **73 rotas** compiladas com sucesso no `npm run build`.
    - 0 erros e 0 warnings no `npm run lint`.
- **Critérios de aceite atendidos**:
  - [x] Revisão de segurança completa (RLS, server-only service role, sanitização, rate limits e Zod).
  - [x] LGPD: Banner de cookies, páginas `/privacidade` e `/termos`.
  - [x] Páginas 404 e 500 personalizadas.
  - [x] Guia de deploy em produção [`docs/DEPLOY.md`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/docs/DEPLOY.md) criado.
  - [x] Manual do usuário [`docs/MANUAL.md`](file:///c:/Users/eu/Documents/P4D/Projetos/portal%20empire/docs/MANUAL.md) criado.
  - [x] Sistema pronto para Go-Live com 73 rotas validadas.

---

## Checklist Final de Produção (Item 12 do PRD)

- [x] **0. Setup**: Next.js 15, TypeScript, Tailwind, App Router, shadcn/ui e estrutura de pastas oficial.
- [x] **1. Banco & RLS**: 17 tabelas, enums, triggers, RPCs, views públicas e RLS 100% ativo.
- [x] **2. Autenticação**: Login, autocadastro pendente, recuperação de senha, RBAC e gestão de usuários.
- [x] **3. Portal Público**: Home com blocos dinâmicos, matérias, colunas, cidades, busca, SEO, Sitemap e RSS.
- [x] **4. Editor de Matérias**: Tiptap rico, upload de imagens (5MB), embeds, tags, SEO e agendamento.
- [x] **5. Captação RSS**: Parser com timeout, deduplicação SHA-256, categorização automática e cron a cada 5 minutos.
- [x] **6. Colunas Municipais**: Gestão de colunas, moderação de status e isolamento total entre colunistas.
- [x] **7. Marketplace de Anúncios**: Formatos, espaços, anti-sobreposição de datas, impressões únicas e métricas diárias.
- [x] **8. Pagamentos Asaas**: Subcontas de colunistas, Split automático, QR Code PIX, botão WhatsApp e webhooks idempotentes.
- [x] **9. Painel Admin Completo**: Dashboard executivo, personalização de marca e cores, reordenação da Home sem código e auditoria.
- [x] **10. Polimento & Deploy**: LGPD, páginas de erro, `docs/DEPLOY.md`, `docs/MANUAL.md`, 0 erros no build e pronto para produção.


