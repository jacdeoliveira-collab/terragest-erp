import { useState, useEffect } from 'react';
import { useFuncionarios } from '../../../../hooks/useFuncionarios';
import { useFormaContaSync } from '../../../../hooks/useFormaContaSync';
import { useTenantContext } from '../../../../contexts/TenantContext';
import { lancarValeColaborador } from '../../../../services/valeRhService';
import { gerarReciboValeRhPDF } from '../../../../utils/reciboValeRhPdf';
import type { Funcionario } from '../../../../types/rh.types';

export function useLancarValeFormState(funcionarioInicial?: Funcionario | null, onSuccess?: () => void, onClose?: () => void) {
  const { tenantAtivoId } = useTenantContext();
  const { data: colaboradores } = useFuncionarios({ onlyActives: true });
  const [colaboradorId, setColaboradorId] = useState<string>('');
  const [colaboradorNome, setColaboradorNome] = useState<string>('');
  const [valor, setValor] = useState<string>('');
  const [data, setData] = useState<string>(new Date().toISOString().slice(0, 10));
  const [forma, setForma] = useState<string>('Dinheiro');
  const [contaId, setContaId] = useState<string>('');
  const [motivo, setMotivo] = useState<string>('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const { contas, contaPadrao, onFormaChange, onContaChange } = useFormaContaSync(contaId, setForma, setContaId, 'Dinheiro');

  useEffect(() => {
    if (funcionarioInicial) {
      setColaboradorId(funcionarioInicial.id);
      setColaboradorNome(funcionarioInicial.nome);
    } else if (colaboradores.length > 0 && !colaboradorId) {
      setColaboradorId(colaboradores[0].id);
      setColaboradorNome(colaboradores[0].nome);
    }
  }, [funcionarioInicial, colaboradores, colaboradorId]);

  useEffect(() => {
    if (!contaId && contaPadrao?.id) setContaId(contaPadrao.id);
  }, [contaPadrao, contaId]);

  const colabSel = colaboradores.find((c) => c.id === colaboradorId) || funcionarioInicial;

  const handleSalvar = async (imprimir: boolean) => {
    const v = parseFloat(valor);
    if (!v || v <= 0) { setErro('Informe um valor válido maior que zero.'); return; }
    if (!colaboradorNome) { setErro('Selecione um colaborador.'); return; }

    try {
      setSalvando(true);
      setErro(null);
      const res = await lancarValeColaborador({
        tenantId: tenantAtivoId || undefined,
        colaboradorId,
        colaboradorNome,
        valor: v,
        data,
        formaPagamento: forma,
        contaBancariaId: contaId || null,
        observacao: motivo.trim() || undefined
      });

      if (!res.success) throw new Error(res.error || 'Erro ao registrar');

      if (imprimir) {
        gerarReciboValeRhPDF({
          colaboradorNome,
          colaboradorCargo: colabSel?.cargo ? String(colabSel.cargo).replace('_', ' ') : undefined,
          colaboradorCpf: colabSel?.cpf,
          valorVale: v,
          dataVale: data,
          formaPagamento: forma,
          motivo: motivo.trim() || undefined
        });
      }

      onSuccess?.();
      onClose?.();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Falha ao registrar vale');
    } finally {
      setSalvando(false);
    }
  };

  return {
    colaboradores, colaboradorId, setColaboradorId, colaboradorNome, setColaboradorNome,
    valor, setValor, data, setData, forma, onFormaChange,
    contaId, onContaChange, contas, motivo, setMotivo,
    salvando, erro, handleSalvar
  };
}

