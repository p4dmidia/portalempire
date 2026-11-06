-- Adicionar campos de endereço completo na tabela profiles para dados de colunistas e equipe
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS endereco text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cep text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cidade text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS uf text;

