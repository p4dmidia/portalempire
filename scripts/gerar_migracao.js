const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const migrationsDir = path.join(rootDir, 'supabase', 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

let fullSql = `-- ==============================================================================
-- PORTAL EMPIRE: SCRIPT COMPLETO DE MIGRAÇÃO PARA NOVO PROJETO SUPABASE
-- Execute este script no SQL Editor do novo projeto Supabase.
-- Ele cria:
-- 1. Extensões e Tipos (Enums)
-- 2. Todas as Tabelas do Sistema (Portais, Profiles, Matérias, Colunas, Categorias, Cidades, etc.)
-- 3. RLS e Políticas de Segurança
-- 4. Funções e Triggers
-- 5. Tabelas auxiliares (Revistas, Classificados, Afiliados, etc.)
-- 6. Seeds iniciais (Editorias completas, Fontes RSS de captação, Cidades de MG e Brasil)
-- 7. Formatos e Espaços Publicitários IAB
-- 8. Configuração de Buckets de Armazenamento (Storage)
-- 9. Usuário Administrador Principal (admin@empirecidades.com.br / admin123)
-- 10. Colunista Agência P4D + Coluna Belo Horizonte em Foco + Banners
-- ==============================================================================

`;

for (const file of migrationFiles) {
  fullSql += `\n-- ==============================================================================\n`;
  fullSql += `-- MIGRATION: ${file}\n`;
  fullSql += `-- ==============================================================================\n\n`;
  fullSql += fs.readFileSync(path.join(migrationsDir, file), 'utf8') + '\n';
}

const seedPath = path.join(rootDir, 'supabase', 'seed.sql');
if (fs.existsSync(seedPath)) {
  fullSql += `\n-- ==============================================================================\n`;
  fullSql += `-- SEED INICIAL DE DADOS DO SISTEMA\n`;
  fullSql += `-- ==============================================================================\n\n`;
  fullSql += fs.readFileSync(seedPath, 'utf8') + '\n';
}

const adminPath = path.join(rootDir, 'supabase', 'criar_admin_empirecidades.sql');
if (fs.existsSync(adminPath)) {
  fullSql += `\n-- ==============================================================================\n`;
  fullSql += `-- CRIAÇÃO DO USUÁRIO ADMINISTRADOR (admin@empirecidades.com.br / admin123)\n`;
  fullSql += `-- ==============================================================================\n\n`;
  fullSql += fs.readFileSync(adminPath, 'utf8') + '\n';
}

// Storage Buckets & Policies
fullSql += `\n-- ==============================================================================
-- CONFIGURAÇÃO DOS BUCKETS DO SUPABASE STORAGE
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('anuncios', 'anuncios', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('revistas', 'revistas', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('materias', 'materias', true) ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ BEGIN
  CREATE POLICY "Public Read Anuncios" ON storage.objects FOR SELECT USING (bucket_id = 'anuncios');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Insert Anuncios" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'anuncios');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Update Anuncios" ON storage.objects FOR UPDATE USING (bucket_id = 'anuncios');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Read Revistas" ON storage.objects FOR SELECT USING (bucket_id = 'revistas');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Insert Revistas" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'revistas');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Read Materias" ON storage.objects FOR SELECT USING (bucket_id = 'materias');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Insert Materias" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'materias');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`;

// Seed dos formatos e espaços publicitários completos
fullSql += `\n-- ==============================================================================
-- FORMATOS E ESPAÇOS PUBLICITÁRIOS DA PLATAFORMA
-- ==============================================================================

INSERT INTO public.formatos_anuncio (id, nome, posicao, largura, altura, descricao, preco_base)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Super Banner Topo', 'topo', 970, 90, 'Exibido com destaque máximo no topo da página', 500.00),
  ('f0000000-0000-0000-0000-000000000002', 'Retângulo Lateral', 'lateral', 300, 250, 'Exibido na barra lateral ao lado das notícias', 350.00),
  ('f0000000-0000-0000-0000-000000000003', 'Meio de Texto', 'meio_texto', 728, 90, 'Inserido no meio da leitura das matérias', 400.00),
  ('f0000000-0000-0000-0000-000000000004', 'Banner Entre Blocos Home', 'home_entre_blocos', 970, 90, 'Banner horizontal entre editorias da página inicial', 450.00),
  ('f0000000-0000-0000-0000-000000000005', 'Banner Rodapé', 'rodape', 970, 90, 'Exibido no rodapé de todas as páginas', 250.00)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  posicao = EXCLUDED.posicao,
  largura = EXCLUDED.largura,
  altura = EXCLUDED.altura;

INSERT INTO public.espacos_anuncio (id, portal_id, formato_id, dono_tipo, nome, preco_mensal, ativo)
VALUES
  ('8547e164-919e-4564-b861-6a76f9c08773', 'a0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'plataforma', 'Super Banner Topo (Geral do Portal)', 500.00, true),
  ('27006ced-cdd0-4305-930f-ba17388635cc', 'a0000000-0000-0000-0000-000000000002', 'plataforma', 'Retângulo Lateral (Geral do Portal)', 350.00, true),
  ('2171284b-18ff-4a37-b90f-318755d483cc', 'a0000000-0000-0000-0000-000000000003', 'plataforma', 'Meio de Texto (Geral do Portal)', 400.00, true),
  ('63155137-2827-4ba7-a1c7-1d0eb48bd47a', 'a0000000-0000-0000-0000-000000000004', 'plataforma', 'Banner Entre Blocos Home (Geral do Portal)', 450.00, true),
  ('e9867d96-4254-4f3e-a267-590e05093451', 'a0000000-0000-0000-0000-000000000005', 'plataforma', 'Banner Rodapé (Geral do Portal)', 250.00, true)
ON CONFLICT (id) DO NOTHING;

-- Seed do Usuário Colunista (Agência P4D) e da Coluna Belo Horizonte em Foco
DO $$
DECLARE
  v_colunista_id uuid := '2d4280d1-25cc-4eb2-99d5-4ca44c9f8785';
  v_coluna_id uuid := '77a825a3-db96-49a0-9e60-e11d6b4aee9e';
  v_anunciante_id uuid := '3f6fcfd2-ef7f-4390-aa05-fd70c77e55c7';
  v_espaco_topo uuid := 'bef42427-6666-40e0-a760-144ad1553f27';
  v_espaco_rodape uuid := '77b59a41-51a4-4ecb-9df7-90e68f9c0029';
  v_cidade_id uuid;
  v_enc_pass text;
BEGIN
  -- 1. Obter ID da cidade de Belo Horizonte
  SELECT id INTO v_cidade_id FROM public.cidades WHERE slug = 'belo-horizonte' LIMIT 1;

  -- 2. Inserir usuário colunista em auth.users se não existir
  v_enc_pass := crypt('admin123', gen_salt('bf'));
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_colunista_id) THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      v_colunista_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'agenciap4d123@gmail.com', v_enc_pass, now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"nome": "Agência P4D - Marketing Digital"}'::jsonb,
      now(), now()
    );
  END IF;

  -- 3. Inserir ou atualizar perfil
  INSERT INTO public.profiles (
    id, portal_id, nome, slug, email, role, status
  ) VALUES (
    v_colunista_id, 'a0000000-0000-0000-0000-000000000001',
    'Agência P4D - Marketing Digital', 'agencia-p4d-marketing-digital',
    'agenciap4d123@gmail.com', 'colunista', 'ativo'
  ) ON CONFLICT (id) DO UPDATE SET status = 'ativo', role = 'colunista';

  -- 4. Inserir a coluna
  INSERT INTO public.colunas (
    id, portal_id, dono_id, cidade_id, nome, slug, descricao, status, aceita_anuncios
  ) VALUES (
    v_coluna_id, 'a0000000-0000-0000-0000-000000000001', v_colunista_id, v_cidade_id,
    'belo horizonte em foco', 'belo-horizonte-em-foco', 'Notícias e acontecimentos de Belo Horizonte e região metropolitana.',
    'ativa', true
  ) ON CONFLICT (id) DO NOTHING;

  -- 5. Inserir espaços da coluna
  INSERT INTO public.espacos_anuncio (
    id, portal_id, coluna_id, formato_id, dono_tipo, nome, preco_mensal, ativo
  ) VALUES 
    (v_espaco_topo, 'a0000000-0000-0000-0000-000000000001', v_coluna_id, 'f0000000-0000-0000-0000-000000000001', 'coluna', 'Super Banner Topo - belo horizonte em foco', 500.00, true),
    (v_espaco_rodape, 'a0000000-0000-0000-0000-000000000001', v_coluna_id, 'f0000000-0000-0000-0000-000000000005', 'coluna', 'Banner Rodapé - belo horizonte em foco', 250.00, true)
  ON CONFLICT (id) DO NOTHING;

  -- 6. Inserir anunciante
  INSERT INTO public.anunciantes (
    id, portal_id, dono_id, nome, email, telefone
  ) VALUES (
    v_anunciante_id, 'a0000000-0000-0000-0000-000000000001', v_colunista_id,
    'Empire Rádio & TV', 'contato@empirecidades.com.br', '11999999999'
  ) ON CONFLICT (id) DO NOTHING;

  -- 7. Inserir anúncio do banner
  INSERT INTO public.anuncios (
    id, espaco_id, anunciante_id, dono_id, titulo,
    imagem_desktop_url, link_destino, inicio_em, fim_em, status, valor
  ) VALUES (
    '3f0b8284-c33c-45ee-a835-bbd435c80767', v_espaco_topo, v_anunciante_id, v_colunista_id,
    'Empire Rádio & TV [paginas:todas]',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=970',
    'https://www.empireflixvip.com/radio', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'ativo', 500.00
  ) ON CONFLICT (id) DO NOTHING;
END $$;
`;

const outputPath = path.join(rootDir, 'supabase', 'migracao_completa_novo_projeto.sql');
fs.writeFileSync(outputPath, fullSql, 'utf8');
console.log('Saved unified migration script to:', outputPath, 'Length:', fullSql.length, 'bytes');
