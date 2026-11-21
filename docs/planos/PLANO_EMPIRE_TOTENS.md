# Plano de Implementação — Empire Totens no Portal Empire Cidades

> **Identidade Visual:** Em conformidade com a solicitação, **o módulo adotará fundo claro/branco** (`bg-slate-50` / `bg-white`), tipografia refinada em tons escuros e detalhes sofisticados em dourado/âmbar, seguindo o padrão elegante estabelecido na vitrine de Talentos Empire.

---

## 1. Visão Geral da Arquitetura

O módulo **Empire Totens** transforma o Portal Empire Cidades em uma vitrine nacional e geolocalizada de mídia digital *Out of Home* (DOOH), permitindo que marcas e comércios locais encontrem os totens publicitários disponíveis na sua cidade e entrem em contato direto com o franqueado responsável.

---

## 2. Estrutura do Banco de Dados (Supabase)

### Tabela `public.totens`
* `id` (uuid, primary key)
* `portal_id` (uuid, FK `portais`)
* `cidade_id` (uuid, FK `cidades`, opcional)
* `cidade_nome` (text, ex: *"Uberlândia"*)
* `estado` (char(2), ex: *"MG"*)
* `nome` (text, identificação do totem, ex: *"Totem 01 - Galeria Center UDI"*)
* `slug` (text, unique, ex: *"totem-01-galeria-center-udi"*)
* `estabelecimento_nome` (text, ex: *"Galeria Center UDI"*)
* `tipo_estabelecimento` (text, ex: *"Shopping Center"*, *"Galeria"*, *"Academia"*, *"Clínica & Saúde"*, *"Restaurante"*, *"Comércio"*)
* `endereco` (text, ex: *"Av. Floriano Peixoto, 530"*)
* `bairro` (text, ex: *"Centro"*)
* `descricao_ponto` (text, ex: *"Dentro da galeria, no saguão principal em área de grande circulação."*)
* `circulacao_estimada` (text, ex: *"25.000 pessoas/mês"*)
* `circulacao_numero` (integer, para ordenação e filtros numéricos)
* `perfil_publico` (text[], ex: *`{"Consumidores", "Estudantes", "Executivos"}`*)
* `modelo_equipamento` (text, ex: *"Totem Digital Vertical 55 polegadas"*)
* `tamanho_tela` (text, ex: *"55'' 4K Ultra HD"*)
* `formato_publicidade` (text, ex: *"20 slots de 15 segundos"*)
* `slots_disponiveis` (integer, ex: 5)
* `slots_total` (integer, ex: 20)
* `duracao_slot_segundos` (integer, default 15)
* `recursos_extras` (text[], ex: *`{"Com carregador de celular", "Tela touch"}`*)
* `foto_url` (text, foto real do totem instalado com upload)
* `galeria_fotos` (text[], fotos adicionais do local)
* `google_maps_url` (text, link direto no Google Maps)
* `latitude` / `longitude` (numeric, opcionais)
* `franqueado_nome` (text, ex: *"Marcelo Olivers"*)
* `franqueado_telefone` (text)
* `franqueado_whatsapp` (text, número para o clique no WhatsApp)
* `franqueado_email` (text)
* `franqueado_user_id` (uuid, FK `profiles`, para controle de franqueado)
* `destaque` (boolean, default false)
* `status` (text: `'ativo'`, `'inativo'`, `'em_manutencao'`)
* `ordem` (integer, default 0)
* `created_at` e `updated_at`

### Tabela `public.totens_solicitacoes`
* `id` (uuid, primary key)
* `totem_id` (uuid, FK `totens`)
* `nome_contato` (text)
* `empresa` (text)
* `whatsapp` (text)
* `email` (text)
* `cidade` (text)
* `mensagem` (text)
* `status` (text: `'pendente'`, `'em_atendimento'`, `'fechado'`, `'cancelado'`)
* `created_at` (timestamptz)

---

## 3. Telas e Componentes a Desenvolver

### 3.1. Vitrine Pública dos Totens (`/totens`)
* **Visual:** Fundo branco/slate suave (`bg-slate-50`), títulos escuros de alto contraste e realces dourados Empire.
* **Cabeçalho:** Banner elegante *"Totens Empire — Mídia digital nas principais cidades, conectando marcas, pessoas e oportunidades"*.
* **Carrossel / Seletor de Cidades:** Cards visuais de cidades com totens instalados (*Uberlândia/MG, Assis/SP, Maringá/PR, Alphaville/SP, São Paulo/SP...*) com foto panorâmica da cidade e contagem de totens.
* **Barra de Busca e Filtros:**
  * Busca por nome, shopping, bairro ou endereço;
  * Filtro por cidade;
  * Filtro por tipo de estabelecimento (Shopping, Academia, Galeria...);
  * Filtro por faixa de circulação ou disponibilidade.
* **Cards dos Totens:**
  * Foto real com selo de identificação (ex: *Totem 01*) e badge de recurso (ex: *Com Carregador*);
  * Nome do local e endereço completo com bairro;
  * Descrição da localização estratégica dentro do ponto comercial;
  * Estatística de público estimado (ex: *25.000 pessoas/mês*);
  * Formato dos anúncios (ex: *20 slots de 15 segundos*);
  * Box do Franqueado com nome e WhatsApp;
  * Ações: **"Ver no Mapa"**, **"Mais Detalhes →"** e **"Anunciar neste Totem"** (WhatsApp direto com mensagem pré-formatada).

### 3.2. Página Individual do Totem (`/totens/[slug]`)
* Galeria de fotos em alta resolução do equipamento e do entorno;
* Ficha técnica completa (modelo, tamanho de tela, tecnologia, slots);
* Dados de audiência e perfil de quem circula no local;
* Mapa de localização integrado;
* Card lateral comercial com contato direto do franqueado e formulário de solicitação.

### 3.3. Integração na Página da Cidade (`/cidade/[slug]`)
* Seção final elegante: **"CONHEÇA OS TOTENS PUBLICITÁRIOS DA SUA CIDADE"**;
* Exibe os totens ativos instalados no município com link rápido para anunciar.

### 3.4. Integração no Menu Superior (`Header.tsx`)
* Link **"Totens"** adicionado ao menu de navegação do portal (desktop e gaveta mobile).

### 3.5. Painel Administrativo (`/painel/admin/totens`)
* **Aba 1 — Gestão de Totens:**
  * Tabela e cards com foto, cidade, estabelecimento, franqueado e slots;
  * Botão de ativação/desativação instantânea com 1 clique (*Ativo / Inativo*);
  * Botão de Edição e Exclusão;
  * Modal completo de cadastro com upload de fotos para o bucket do Supabase.
* **Aba 2 — Propostas e Leads Recebidos:**
  * Acompanhamento de mensagens de anunciantes com botão de resposta direta no WhatsApp.
