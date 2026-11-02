-- =============================================================================
-- MIGRATION: 20261031000001_mensalidade_colunista_250.sql
-- DESCRIÇÃO: Atualiza o valor oficial da mensalidade de colunista para R$ 250,00
--            e garante comissão recorrente de 20% (R$ 50,00/mês por indicado).
-- =============================================================================

update public.configuracoes
set valor = '250.00'::jsonb
where chave = 'colunista_mensalidade_valor';

update public.configuracoes
set valor = '20.00'::jsonb
where chave = 'afiliados_comissao_percentual';

