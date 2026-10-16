/**
 * Script de teste automatizado para o Módulo de Pagamentos Asaas & Split (Etapa 8)
 * Executar com: npx tsx scripts/testar-pagamentos-asaas.ts
 */

import { criarSubcontaAsaas } from "../lib/asaas/subcontas";
import { criarCobrancaComSplit } from "../lib/asaas/cobrancas";

async function runTests() {
  console.log("=== INICIANDO TESTES DO MÓDULO ASAAS & SPLIT (ETAPA 8) ===\n");

  let passes = 0;
  let failures = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passes++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` — ${detail}` : ""}`);
      failures++;
    }
  }

  try {
    // 1. Teste de criação de Subconta Asaas para Colunista
    console.log("1. Testando Criação de Subconta Asaas...");
    const subconta = await criarSubcontaAsaas({
      name: "Colunista Teste Split",
      email: "colunista.teste@portalempire.com.br",
      cpfCnpj: "12345678909",
      mobilePhone: "11999998888",
      address: "Av. Brasil",
      addressNumber: "500",
      province: "Jardins",
      postalCode: "01430000",
    });

    assert(Boolean(subconta.id), "Subconta criada com ID válido");
    assert(Boolean(subconta.walletId), `WalletId gerado com sucesso (${subconta.walletId})`);
    assert(subconta.name === "Colunista Teste Split", "Nome da subconta confere com o payload");

    // 2. Teste de Cobrança com Split de Pagamento
    console.log("\n2. Testando Criação de Cobrança com Split Asaas...");
    const valorAnuncio = 500.0;
    const comissaoPercentual = 20; // 20% plataforma
    const valorComissao = (valorAnuncio * comissaoPercentual) / 100; // 100.00
    const valorLiquidoColunista = valorAnuncio - valorComissao; // 400.00

    const cobranca = await criarCobrancaComSplit({
      cliente: {
        name: "Auto Peças Campinas Ltda",
        email: "financeiro@autopecas.com.br",
        cpfCnpj: "12345678000199",
        mobilePhone: "19988887777",
      },
      valor: valorAnuncio,
      descricao: "Anúncio Topo da Coluna de Campinas - 30 Dias",
      vencimento: "2026-11-01",
      formaPagamento: "PIX",
      splitColunistaWalletId: subconta.walletId,
      valorLiquidoColunista: valorLiquidoColunista,
      externalReference: "anuncio-mock-uuid-12345",
    });

    assert(Boolean(cobranca.id), `Cobrança criada com ID (${cobranca.id})`);
    assert(cobranca.value === 500.0, "Valor bruto da fatura confere (R$ 500,00)");
    assert(Boolean(cobranca.invoiceUrl), `Link da fatura gerado (${cobranca.invoiceUrl})`);
    assert(Boolean(cobranca.pixQrCode?.payload), "Código PIX Copia e Cola gerado com sucesso");

    // 3. Teste do cálculo do Split
    console.log("\n3. Validando Regras Matemáticas de Split de Pagamento...");
    assert(valorComissao === 100.0, "Valor da comissão retida pela plataforma calculado em R$ 100,00");
    assert(valorLiquidoColunista === 400.0, "Valor líquido repassado ao colunista calculado em R$ 400,00");
    assert(valorComissao + valorLiquidoColunista === valorAnuncio, "Soma (Comissão + Líquido) é igual ao Valor Total");

    console.log(`\n========================================`);
    console.log(`RESULTADO DOS TESTES: ${passes} PASSOU / ${failures} FALHOU`);
    console.log(`========================================\n`);

    if (failures > 0) process.exit(1);
  } catch (err: unknown) {
    console.error("\n❌ Erro durante a execução dos testes:", err);
    process.exit(1);
  }
}

runTests();
