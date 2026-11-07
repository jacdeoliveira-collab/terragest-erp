import { useContasBancarias, isContaCaixaFisico } from './useContasBancarias';

export const formaEhDinheiro = (forma?: string) => (forma || '').toUpperCase().startsWith('DINHEIRO');
export const formaEhEmprestimo = (forma?: string) => (forma || '').toUpperCase() === 'EMPRESTIMO';

/**
 * Sincroniza Forma de Pagamento x Conta:
 * - "Dinheiro" seleciona o Caixa Físico (e vice-versa)
 * - "Empréstimo" seleciona 'EMPRESTIMO' na Conta de Saída (e vice-versa)
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
    if (formaEhEmprestimo(v)) {
      setConta('EMPRESTIMO');
    } else if (formaEhDinheiro(v)) {
      if (contaCaixa) setConta(contaCaixa.id);
      else setConta('');
    } else if ((contaId === 'EMPRESTIMO' || isContaCaixaFisico(contaAtual)) && contaPadrao && !isContaCaixaFisico(contaPadrao)) {
      setConta(contaPadrao.id);
    } else if (contaId === 'EMPRESTIMO') {
      setConta('');
    }
  };

  const onContaChange = (id: string) => {
    setConta(id);
    if (id === 'EMPRESTIMO') {
      setForma('EMPRESTIMO');
    } else if (isContaCaixaFisico(contas.find((c) => c.id === id)) || id === '') {
      setForma(valorDinheiro);
    }
  };

  return { contas, contaCaixa, contaPadrao, onFormaChange, onContaChange };
}
