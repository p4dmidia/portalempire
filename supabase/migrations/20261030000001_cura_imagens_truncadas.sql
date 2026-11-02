-- =============================================================================
-- MIGRATION: 20261030000001_cura_imagens_truncadas.sql
-- DESCRIÇÃO: Corrige registros existentes na tabela materias que ficaram com
--            URL de imagem do Cloudflare Image Resizing truncada sem caminho
--            do arquivo (ex: https://lncimg.lance.com.br/cdn-cgi/image/width=1200)
-- =============================================================================

update public.materias
set imagem_url = case (abs(hashtext(id::text)) % 3)
  when 0 then 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200'
  when 1 then 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=1200'
  else 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=1200'
end
where imagem_url = 'https://lncimg.lance.com.br/cdn-cgi/image/width=1200'
   or imagem_url ~* '/cdn-cgi/image/[^/]+$';

