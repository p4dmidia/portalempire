-- Migration: Adicionar coluna foto_posicao_y na tabela talentos para reposicionamento vertical da foto de perfil
ALTER TABLE talentos
ADD COLUMN IF NOT EXISTS foto_posicao_y integer DEFAULT 50;
