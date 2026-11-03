import { useContasBancarias, isContaCaixaFisico } from './useContasBancarias';

export const formaEhDinheiro = (forma?: string) => (forma || '').toUpperCase().startsWith('DINHEIRO');

/**
 * Sincroniza Forma de Pagamento x Conta: "Dinheiro" seleciona o Caixa Físico
 * e escolher o Caixa Físico muda a forma para "Dinheiro" (e vice-versa).
 */
export function useFormaContaSync(
  contaId: string,
  setForma: (v: any) => void,
  setConta: (v: string) => void,
  valorDinheiro: string = 'DINHEIRO'
) {
  const { contas, contaCaixa, contaPadrao } = useContasBancarias();

  const onFormaChange = (v: string) => {
    setForma(v);
    const contaAtual = contas.find((c) => c.id === contaId);
    if (formaEhDinheiro(v)) {
      if (contaCaixa) setConta(contaCaixa.id);
    } else if (isContaCaixaFisico(contaAtual) && contaPadrao && !isContaCaixaFisico(contaPadrao)) {
      setConta(contaPadrao.id);
    }
  };

  const onContaChange = (id: string) => {
    setConta(id);
    if (isContaCaixaFisico(contas.find((c) => c.id === id))) setForma(valorDinheiro);
  };

  return { contas, contaCaixa, contaPadrao, onFormaChange, onContaChange };
}
