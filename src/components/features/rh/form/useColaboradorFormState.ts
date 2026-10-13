import { useState } from 'react';
import { useCreateFuncionario } from '../../../../hooks/useCreateFuncionario';
import { supabase } from '../../../../lib/supabase';
import { uploadParaGoogleDrive } from '../../../../services/driveService';
import type { CargoFuncionario, StatusFuncionario, Funcionario } from '../../../../types/rh.types';

interface UseColaboradorFormStateProps {
  funcionarioParaEditar?: Funcionario | null;
  onSuccess: () => void;
  onUpdateFuncionario?: (id: string, payload: Partial<Funcionario>) => Promise<{ success: boolean; error?: string }>;
}

export function useColaboradorFormState({
  funcionarioParaEditar,
  onSuccess,
  onUpdateFuncionario
}: UseColaboradorFormStateProps) {
  const { createFuncionario } = useCreateFuncionario();
  const [activeTab, setActiveTab] = useState<'pessoais' | 'documentais' | 'financeiros'>('pessoais');
  const [uploadingDrive, setUploadingDrive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nome, setNome] = useState(funcionarioParaEditar?.nome || '');
  const [cargo, setCargo] = useState<CargoFuncionario>(funcionarioParaEditar?.cargo || 'OPERADOR_MAQUINA');
  const [status, setStatus] = useState<StatusFuncionario>(funcionarioParaEditar?.status || 'ATIVO');
  const [telefone, setTelefone] = useState(funcionarioParaEditar?.telefone || '');
  const [pinAssinatura, setPinAssinatura] = useState(funcionarioParaEditar?.pin_assinatura || '');
  const [enderecoCompleto, setEnderecoCompleto] = useState(funcionarioParaEditar?.endereco_completo || '');

  const [cpf, setCpf] = useState(funcionarioParaEditar?.cpf || '');
  const [rg, setRg] = useState(funcionarioParaEditar?.rg || '');
  const [cnh, setCnh] = useState(funcionarioParaEditar?.cnh || '');
  const [validadeCnh, setValidadeCnh] = useState(funcionarioParaEditar?.validade_cnh || funcionarioParaEditar?.vencimento_cnh || '');
  const [ctps, setCtps] = useState(funcionarioParaEditar?.ctps || '');
  const [pisPasep, setPisPasep] = useState(funcionarioParaEditar?.pis_pasep || '');
  const [tituloEleitor, setTituloEleitor] = useState(funcionarioParaEditar?.titulo_eleitor || '');
  const [reservista, setReservista] = useState(funcionarioParaEditar?.reservista || '');
  const [asoValidade, setAsoValidade] = useState(funcionarioParaEditar?.aso_validade || funcionarioParaEditar?.vencimento_aso || '');
  const [arquivoDocumento, setArquivoDocumento] = useState<File | null>(null);
  const [driveUrlDocumentos, setDriveUrlDocumentos] = useState(funcionarioParaEditar?.drive_url_documentos || '');

  const [salarioBase, setSalarioBase] = useState<number>(funcionarioParaEditar?.salario_base ?? 0);
  const [custoHoraNormal, setCustoHoraNormal] = useState<number>(funcionarioParaEditar?.custo_hora_normal ?? 0);
  const [valorHoraExtra, setValorHoraExtra] = useState<number>(funcionarioParaEditar?.valor_hora_extra ?? 0);
  const [limiteHorasDiario, setLimiteHorasDiario] = useState<number>(funcionarioParaEditar?.limite_horas_diario ?? 8);
  const [diaPagamento, setDiaPagamento] = useState<number>(funcionarioParaEditar?.dia_pagamento ?? 5);
  const [diaFechamento, setDiaFechamento] = useState<number>(funcionarioParaEditar?.dia_fechamento ?? 31);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let urlFinal = driveUrlDocumentos;
      if (arquivoDocumento) {
        setUploadingDrive(true);
        const uploadRes = await uploadParaGoogleDrive(arquivoDocumento, 'rh');
        setUploadingDrive(false);
        if (!uploadRes.sucesso || !uploadRes.driveUrl) {
          throw new Error(`Erro no Google Drive: ${uploadRes.erro || 'Falha ao salvar arquivo'}`);
        }
        urlFinal = uploadRes.driveUrl;
        setDriveUrlDocumentos(urlFinal);
      }

      const dadosPayload = {
        nome: nome.trim(),
        cargo,
        status,
        pin_assinatura: pinAssinatura || undefined,
        telefone: telefone || undefined,
        endereco_completo: enderecoCompleto || undefined,
        cpf: cpf || undefined,
        rg: rg || undefined,
        cnh: cnh || undefined,
        validade_cnh: validadeCnh || undefined,
        vencimento_cnh: validadeCnh || undefined,
        ctps: ctps || undefined,
        pis_pasep: pisPasep || undefined,
        titulo_eleitor: tituloEleitor || undefined,
        reservista: reservista || undefined,
        aso_validade: asoValidade || undefined,
        vencimento_aso: asoValidade || undefined,
        drive_url_documentos: urlFinal || undefined,
        salario_base: Number(salarioBase) || 0,
        custo_hora_normal: Number(custoHoraNormal) || 0,
        valor_hora_extra: Number(valorHoraExtra) || 0,
        limite_horas_diario: Number(limiteHorasDiario) || 8,
        dia_pagamento: Number(diaPagamento) || 5,
        dia_fechamento: Number(diaFechamento) || 31
      };

      if (funcionarioParaEditar?.id) {
        if (onUpdateFuncionario) {
          const res = await onUpdateFuncionario(funcionarioParaEditar.id, dadosPayload);
          if (!res.success) throw new Error(res.error || 'Erro ao atualizar colaborador');
        } else {
          const { error: err } = await supabase
            .from('rh_funcionarios')
            .update({ ...dadosPayload, updated_at: new Date().toISOString() })
            .eq('id', funcionarioParaEditar.id);
          if (err) throw new Error(err.message);
        }
        onSuccess();
      } else {
        const res = await createFuncionario(dadosPayload);
        if (res.success) {
          onSuccess();
        } else {
          throw new Error(res.error || 'Erro ao cadastrar colaborador');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha na operação');
    } finally {
      setIsSubmitting(false);
      setUploadingDrive(false);
    }
  };

  return {
    activeTab, setActiveTab, uploadingDrive, isSubmitting, error, limparErro: () => setError(null),
    nome, setNome, cargo, setCargo, status, setStatus, telefone, setTelefone,
    pinAssinatura, setPinAssinatura, enderecoCompleto, setEnderecoCompleto,
    cpf, setCpf, rg, setRg, cnh, setCnh, validadeCnh, setValidadeCnh,
    ctps, setCtps, pisPasep, setPisPasep, tituloEleitor, setTituloEleitor,
    reservista, setReservista, asoValidade, setAsoValidade,
    arquivoDocumento, setArquivoDocumento, driveUrlDocumentos,
    salarioBase, setSalarioBase, custoHoraNormal, setCustoHoraNormal,
    valorHoraExtra, setValorHoraExtra, limiteHorasDiario, setLimiteHorasDiario,
    diaPagamento, setDiaPagamento, diaFechamento, setDiaFechamento,
    handleSubmit, isEdicao: Boolean(funcionarioParaEditar?.id)
  };
}
