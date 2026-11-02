-- ==============================================================================
-- MIGRATION: 20261031000002_checkout_colunista_mercadopago.sql
-- DESCRIÇÃO: Função SECURITY DEFINER para ativação automática de colunista após
--            aprovação de pagamento no Mercado Pago (R$ 250,00/mês) e crédito
--            automático de R$ 50,00 (20%) ao colunista indicador.
-- ==============================================================================

create or replace function public.ativar_colunista_pago(
  p_colunista_id uuid,
  p_mp_payment_id text,
  p_valor_pago numeric default 250.00,
  p_forma_pagamento text default 'pix',
  p_cidade_id uuid default null,
  p_nome_coluna text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_portal_id uuid;
  v_nome text;
  v_indicado_por_id uuid;
  v_assinatura_id uuid;
  v_coluna_id uuid;
  v_nome_coluna_final text;
  v_slug_coluna text;
  v_percentual numeric(5,2) := 20.00;
  v_valor_comissao numeric(10,2);
  v_mes_ref text;
  v_prox_vencimento date;
begin
  -- 1. Obter dados do colunista e portal
  select portal_id, nome, indicado_por_id
    into v_portal_id, v_nome, v_indicado_por_id
  from public.profiles
  where id = p_colunista_id;

  if v_portal_id is null then
    select id into v_portal_id from public.portais limit 1;
  end if;

  -- 2. Ativar perfil do colunista imediatamente
  update public.profiles
  set status = 'ativo',
      role = 'colunista',
      updated_at = now()
  where id = p_colunista_id;

  v_prox_vencimento := (current_date + interval '30 days')::date;
  v_mes_ref := to_char(now(), 'YYYY-MM');

  -- 3. Criar ou atualizar assinatura mensal em assinaturas_colunistas
  select id into v_assinatura_id
  from public.assinaturas_colunistas
  where colunista_id = p_colunista_id
  limit 1;

  if v_assinatura_id is not null then
    update public.assinaturas_colunistas
    set status = 'ativa',
        valor_mensal = coalesce(p_valor_pago, 250.00),
        mp_payment_id = p_mp_payment_id,
        forma_pagamento = coalesce(p_forma_pagamento, 'pix'),
        proximo_vencimento = v_prox_vencimento,
        ultimo_pagamento = now(),
        updated_at = now()
    where id = v_assinatura_id;
  else
    insert into public.assinaturas_colunistas (
      portal_id,
      colunista_id,
      valor_mensal,
      mp_payment_id,
      status,
      forma_pagamento,
      proximo_vencimento,
      ultimo_pagamento
    ) values (
      v_portal_id,
      p_colunista_id,
      coalesce(p_valor_pago, 250.00),
      p_mp_payment_id,
      'ativa',
      coalesce(p_forma_pagamento, 'pix'),
      v_prox_vencimento,
      now()
    ) returning id into v_assinatura_id;
  end if;

  -- 4. Garantir que o colunista tenha uma coluna ativa criada
  select id into v_coluna_id
  from public.colunas
  where dono_id = p_colunista_id
  limit 1;

  if v_coluna_id is not null then
    update public.colunas
    set status = 'ativa',
        cidade_id = coalesce(p_cidade_id, cidade_id),
        updated_at = now()
    where dono_id = p_colunista_id;
  else
    v_nome_coluna_final := coalesce(nullif(trim(p_nome_coluna), ''), 'Coluna ' || coalesce(v_nome, 'Empire'));
    v_slug_coluna := lower(regexp_replace(
      translate(v_nome_coluna_final, 'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ', 'aaaaaeeeeiiiiooooouuuucnaaaaaeeeeiiiiooooouuuucn'),
      '[^a-zA-Z0-9]+', '-', 'g'
    )) || '-' || substr(p_colunista_id::text, 1, 4);

    insert into public.colunas (
      portal_id,
      dono_id,
      cidade_id,
      nome,
      slug,
      descricao,
      status,
      aceita_anuncios
    ) values (
      v_portal_id,
      p_colunista_id,
      p_cidade_id,
      v_nome_coluna_final,
      v_slug_coluna,
      'Coluna oficial no Portal Empire Cidades.',
      'ativa',
      true
    ) returning id into v_coluna_id;
  end if;

  -- 5. Creditar comissão recorrente de 20% (R$ 50,00) ao indicador (se houver e não duplicado)
  if v_indicado_por_id is not null and p_mp_payment_id is not null then
    if not exists (
      select 1 from public.comissoes_afiliados where mp_payment_id = p_mp_payment_id
    ) then
      v_valor_comissao := round((coalesce(p_valor_pago, 250.00) * v_percentual) / 100.0, 2);

      update public.profiles
      set saldo_afiliado = coalesce(saldo_afiliado, 0.00) + v_valor_comissao
      where id = v_indicado_por_id;

      insert into public.comissoes_afiliados (
        afiliado_id,
        indicado_id,
        assinatura_id,
        mp_payment_id,
        mes_referencia,
        valor_mensalidade,
        percentual_comissao,
        valor_comissao,
        status
      ) values (
        v_indicado_por_id,
        p_colunista_id,
        v_assinatura_id,
        p_mp_payment_id,
        v_mes_ref,
        coalesce(p_valor_pago, 250.00),
        v_percentual,
        v_valor_comissao,
        'creditado'
      );
    end if;
  end if;

  return jsonb_build_object(
    'sucesso', true,
    'colunista_id', p_colunista_id,
    'assinatura_id', v_assinatura_id,
    'coluna_id', v_coluna_id
  );
end;
$$;

grant execute on function public.ativar_colunista_pago(uuid, text, numeric, text, uuid, text)
  to anon, authenticated, service_role;

