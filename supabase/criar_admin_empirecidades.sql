-- ==============================================================================
-- CRIAÇÃO / ATUALIZAÇÃO DO USUÁRIO ADMINISTRADOR NO SUPABASE
-- Login: admin@empirecidades.com.br
-- Senha: admin123
-- Rota de login administrativo: /admin/login
-- ==============================================================================

-- 1. Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Garantir que a tabela profiles existe e possui as colunas necessárias pelo portal
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Adiciona as colunas necessárias caso a tabela profiles venha do template padrão do Supabase
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nome text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'colunista';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'ativo';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portal_id uuid;

-- 3. Bloco principal de criação e configuração do Administrador
DO $$
DECLARE
  v_user_id uuid;
  v_portal_id uuid := NULL;
  v_email text := 'admin@empirecidades.com.br';
  v_senha text := 'admin123';
  v_nome text := 'Administrador Empire Cidades';
  v_encrypted_password text;
BEGIN
  -- 3.1 Busca o ID do portal de forma dinâmica (se a tabela portais existir)
  IF to_regclass('public.portais') IS NOT NULL THEN
    BEGIN
      EXECUTE 'SELECT id FROM public.portais LIMIT 1' INTO v_portal_id;
    EXCEPTION WHEN OTHERS THEN
      v_portal_id := NULL;
    END;
  END IF;

  -- 3.2 Gerar hash seguro bcrypt da senha
  v_encrypted_password := crypt(v_senha, gen_salt('bf'));

  -- 3.3 Verificar se o usuário já existe em auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(v_email);

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    -- Inserir novo usuário em auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_email,
      v_encrypted_password,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nome', v_nome),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Inserir identidade em auth.identities para autenticação via email/senha
    BEGIN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        v_user_id::text,
        v_user_id,
        jsonb_build_object('sub', v_user_id::text, 'email', v_email),
        'email',
        v_user_id::text,
        now(),
        now(),
        now()
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

  ELSE
    -- Se o usuário já existir, atualiza a senha e confirma o e-mail
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now(),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object('nome', v_nome)
    WHERE id = v_user_id;

    BEGIN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        v_user_id::text,
        v_user_id,
        jsonb_build_object('sub', v_user_id::text, 'email', v_email),
        'email',
        v_user_id::text,
        now(),
        now(),
        now()
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  -- 3.4 Configurar perfil em public.profiles como 'admin' e 'ativo'
  INSERT INTO public.profiles (
    id,
    nome,
    slug,
    email,
    role,
    status
  ) VALUES (
    v_user_id,
    v_nome,
    'admin-empirecidades',
    v_email,
    'admin',
    'ativo'
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = excluded.nome,
    email = excluded.email,
    role = 'admin',
    status = 'ativo',
    updated_at = now();

  -- Se tiver portal_id, vincula de forma segura
  IF v_portal_id IS NOT NULL THEN
    BEGIN
      EXECUTE 'UPDATE public.profiles SET portal_id = $1 WHERE id = $2' USING v_portal_id, v_user_id;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  RAISE NOTICE 'Administrador configurado com sucesso! ID: %', v_user_id;
END $$;

-- 4. Compatibilidade com templates que usam full_name ou username
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
    EXECUTE 'UPDATE public.profiles SET full_name = ''Administrador Empire Cidades'' WHERE email = ''admin@empirecidades.com.br''';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'username') THEN
    EXECUTE 'UPDATE public.profiles SET username = ''admin-empirecidades'' WHERE email = ''admin@empirecidades.com.br''';
  END IF;
END $$;

-- 5. Exibir resultado e confirmar permissões
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.status,
  p.nome
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@empirecidades.com.br';
