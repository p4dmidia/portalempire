# Manual de Operação do Portal Empire

Bem-vindo ao **Portal Empire**. Este manual detalha todos os recursos, fluxos de trabalho e telas operacionais disponíveis para cada perfil de usuário no painel administrativo: **Administrador**, **Editor**, **Colunista** e **Anunciante**.

---

## 1. Visão Geral dos Perfis e Permissões

| Perfil | Acesso Principal | Principais Responsabilidades |
|---|---|---|
| **Administrador** | `/painel/admin/*` | Controle total: aparência do portal, ordem da home, gestão de equipe, colunas, publicidade, captação RSS, financeiro global, configurações e trilha de auditoria. |
| **Editor** | `/painel/editor/*` | Redação e publicação de matérias no Tiptap, upload de imagens, agendamento de publicações, moderação de notícias captadas e métricas do próprio conteúdo. |
| **Colunista** | `/painel/colunista/*` | Criação e gestão de colunas municipais, redação de artigos autorais, cadastro de anunciantes, venda de anúncios com split Asaas e acompanhamento financeiro. |
| **Anunciante** | `/painel/anunciante/*` | Consulta de anúncios contratados, acompanhamento de impressões, cliques, CTR em tempo real e histórico de faturas. |

---

## 2. Guia do Administrador

### 2.1 Dashboard Geral (`/painel/admin/dashboard`)
- **KPIs em Tempo Real**: Produção editorial (hoje e semana), alcance total de visualizações, faturamento bruto do mês, comissão retida pelo portal e status do crawler RSS.
- **Top 5 Matérias**: Ranking das matérias mais lidas do portal com contagem de acessos.
- **Publicidade no Ar**: Total de anúncios ativos, aguardando pagamento, impressões e cliques.
- **Equipe & Usuários**: Resumo da equipe por perfil e alerta de cadastros pendentes de moderação.

### 2.2 Usuários & Equipe (`/painel/admin/usuarios`)
- **Convidar Usuário**: Cria novo usuário com e-mail, nome e papel definido (*Editor*, *Colunista*, *Anunciante* ou *Admin*).
- **Moderar Cadastros**: Usuários autocadastrados iniciam com status `pendente`. Clique em **"Aprovar"** para liberar o acesso ou **"Bloquear"** para revogar.
- **Alterar Papel (Role)**: Modifique permissões de qualquer usuário a qualquer momento.

### 2.3 Aparência & Ordem da Home (`/painel/admin/aparencia`)
- **Identidade Visual**: Altere o nome do portal, domínio e URL da logomarca (PNG/SVG/WebP transparente).
- **Cor Primária**: Escolha a cor principal da marca via seletor hexadecimal ou presets (Azul Royal, Vermelho Notícias, Verde Esmeralda, etc.). A cor selecionada é aplicada automaticamente em todos os botões, badges e detalhes do portal público.
- **Redes Sociais & TV ao Vivo**: Configure links do Instagram, Facebook, YouTube, X/Twitter e WhatsApp, além da URL de transmissão ao vivo do YouTube.
- **Reordenação dos Blocos da Home**: Utilize os botões **Subir** e **Descer** para alterar a sequência dos blocos da página inicial (Destaques, Cards em Foco, Mais Recentes, Carrossel de Notícias Rápidas, Cidades, TV/Shorts, Editorias, Colunistas, Fontes Parceiras).
- **Editorias em Destaque**: Escolha quais editorias têm blocos dedicados na Home e sua ordem de exibição.
- **Vídeos Shorts**: Adicione, edite ou exclua vídeos verticais do YouTube colando o link completo ou o ID.

### 2.4 Editorias & Cidades (`/painel/admin/editorias` e `/painel/admin/cidades`)
- **Editorias**: Crie categorias temáticas com cor, hierarquia pai/filha, ordem nos menus e **palavras-chave para classificação automática no RSS**.
- **Cidades**: Cadastre municípios com UF, ordem de exibição, destaque na barra superior e **palavras-chave para classificação automática no RSS**.

### 2.5 Captação RSS Automatizada (`/painel/admin/captacao`)
- **Fontes RSS**: Cadastre feeds de notícias de qualquer veículo com intervalo de verificação e categoria padrão.
- **Testar Feed**: Pré-visualize os 5 últimos itens de um feed sem salvar no banco de dados.
- **Executar Agora**: Dispare a coleta manual imediata de todas as fontes ou de uma fonte específica.
- **Matérias Captadas**: Visualize todas as notícias coletadas, reclassifique cidade/categoria ou despublique conforme necessário.
- **Logs de Execução**: Acompanhe o histórico de execuções com itens lidos, novos e eventuais erros de feed.

### 2.6 Publicidade Global & Formatos (`/painel/admin/anuncios`)
- **Formatos de Anúncio**: Gerencie dimensões em pixels para Desktop e Mobile, posições (Topo, Lateral, Meio do Texto, Entre Blocos, Rodapé) e defina o **Preço Mínimo Obrigatório**.
- **Espaços da Plataforma**: Crie slots publicitários globais para a Home e páginas de matérias.
- **Todos os Anúncios**: Acompanhe todas as campanhas ativas, pause, ative ou visualize métricas diárias.

### 2.7 Financeiro Global (`/painel/admin/financeiro`)
- Visualize o faturamento bruto consolidado, a comissão retida pela plataforma e o total repassado aos colunistas.
- **Exportação CSV**: Baixe o extrato financeiro completo com 1 clique para conciliação contábil.
- **Confirmação Manual**: Registre pagamentos feitos por PIX direto ou transferência bancária fora do Asaas.

### 2.8 Configurações Gerais (`/painel/admin/configuracoes`)
- `comissao_padrao_percentual`: Percentual padrão de comissão da plataforma sobre cada anúncio (ex: 20%).
- `autocadastro_colunista`: Permite ou bloqueia novos cadastros públicos de colunistas.
- `aprovar_colunas_manual`: Define se colunas novas precisam de aprovação prévia do admin.
- `captacao_ativa_global`: Liga ou desliga globalmente o crawler de captação RSS.
- `captacao_arquivar_dias`: Quantidade de dias para manter matérias captadas antes de expirar.

### 2.9 Trilha de Auditoria (`/painel/admin/auditoria`)
- Registro cronológico e imutável de todas as ações executadas no sistema (criação de matérias, aprovação de usuários, alteração de configurações, etc.).
- Filtros por palavra-chave, período e visualizador do payload JSON formatado.

---

## 3. Guia do Editor

### 3.1 Redação de Matérias (`/painel/editor/materias/nova`)
1. **Título e Subtítulo**: Digite o título; o slug da URL será gerado automaticamente (e pode ser personalizado).
2. **Resumo**: Insira um resumo conciso para exibição em cards da Home e em compartilhamentos de redes sociais.
3. **Editor Rico (Tiptap)**:
   - Formatações: Negrito, itálico, títulos H2/H3, listas, citações e links.
   - **Upload de Imagens**: Clique no botão de imagem para fazer upload direto (limite de 5MB, convertido automaticamente).
   - **Vídeos do YouTube**: Cole a URL de qualquer vídeo do YouTube para criar um embed responsivo.
4. **Capa & Créditos**: Faça o upload da imagem de destaque e informe os devidos créditos fotográficos.
5. **Classificação & SEO**: Selecione a Editoria, Cidade (opcional), tags e defina as meta-tags de SEO.
6. **Publicação**:
   - **Rascunho**: Salve para continuar editando depois.
   - **Publicar Agora**: A matéria entra no ar instantaneamente na Home e nas páginas de editoria.
   - **Agendar**: Defina uma data e hora futura; o cron automático publicará a matéria no horário exato.

### 3.2 Minhas Matérias (`/painel/editor/materias`)
- Tabela com busca, filtros por status, editoria e cidade.
- Ações rápidas: Editar, Ver no Portal, Publicar/Despublicar com 1 clique e Excluir.

---

## 4. Guia do Colunista

### 4.1 Configuração de Recebimento (`/painel/colunista/financeiro`)
1. Acesse o menu **Financeiro** e clique em **"Configurar Dados de Recebimento"**.
2. Preencha seus dados cadastrais (Nome, CPF/CNPJ, e-mail, telefone e endereço).
3. Uma subconta Asaas será criada automaticamente vinculada ao seu perfil para que você receba repasses líquidos de anúncios via Split.

### 4.2 Minhas Colunas (`/painel/colunista/colunas`)
- Crie colunas temáticas municipais com nome, slug, cidade associada, descrição e capa personalizada.
- Acompanhe o status da coluna (*Ativa* ou *Aguardando Moderação*).

### 4.3 Meus Artigos (`/painel/colunista/artigos/novo`)
- Redija artigos de opinião vinculados obrigatoriamente a uma de suas colunas ativas.
- Utilize todas as ferramentas do editor rico e publique para seus leitores.

### 4.4 Espaços e Anúncios da Coluna
1. **Cadastre Espaços** (`/painel/colunista/espacos`): Selecione o formato desejado (ex: Retângulo Lateral) e defina seu preço mensal (deve ser $\ge$ ao preço mínimo estipulado pela plataforma).
2. **Cadastre Anunciantes** (`/painel/colunista/anunciantes`): Registre clientes comerciais locais (nome, empresa, e-mail e WhatsApp).
3. **Crie Anúncios** (`/painel/colunista/anuncios`):
   - Selecione o anunciante, o espaço e o período de veiculação.
   - Faça upload das artes para Desktop e Mobile e insira o link de destino.
   - O sistema valida automaticamente se já existe outro anúncio ativo no mesmo período para evitar sobreposição.
4. **Cobrança & WhatsApp**:
   - Ao salvar o anúncio, um pedido Asaas com Split é gerado.
   - O sistema exibe o **QR Code PIX**, a **chave Copia e Cola** e o botão **"Enviar por WhatsApp"** com mensagem formatada para cobrança imediata do anunciante.

---

## 5. Guia do Anunciante

- **Acompanhamento de Campanhas** (`/painel/anunciante/anuncios`):
  - Visualize todos os seus anúncios contratados e status de veiculação.
  - Acesse o relatório de **Métricas & Cliques** para auditar impressões, cliques e taxa de engajamento (CTR) em tempo real.
  - Acesse links de faturas e comprovantes de pagamento.
