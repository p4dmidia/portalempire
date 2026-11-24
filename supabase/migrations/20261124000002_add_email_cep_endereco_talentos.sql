-- Adiciona colunas complementares à tabela talentos (se ainda não existirem)
ALTER TABLE public.talentos ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.talentos ADD COLUMN IF NOT EXISTS cep text;
ALTER TABLE public.talentos ADD COLUMN IF NOT EXISTS endereco text;
ALTER TABLE public.talentos ADD COLUMN IF NOT EXISTS foto_posicao_y integer default 50;
ALTER TABLE public.talentos ADD COLUMN IF NOT EXISTS foto_capa_posicao_y integer default 50;
