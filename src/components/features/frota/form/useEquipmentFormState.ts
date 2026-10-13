import { useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useCreateEquipment } from '../../../../hooks/useCreateEquipment';
import { uploadParaGoogleDrive } from '../../../../services/driveService';
import { criarPlanoRevisaoInicial } from '../../../../services/planoRevisaoService';
import { isVehicleOrTruck } from '../../../../utils/equipmentMeasurement';
import { parseEquipmentMarcaModelo } from '../../../../utils/equipmentModelHelper';
import type { Equipment, TipoPropriedadeEquipamento } from '../../../../types/equipment.types';

export function useEquipmentFormState(onSuccess: () => void, equipmentParaEditar?: Equipment | null) {
  const { createEquipment, isSubmitting: isCreating, error: createError, limparErro } = useCreateEquipment();
  const [uploadingDrive, setUploadingDrive] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const parsed = parseEquipmentMarcaModelo(equipmentParaEditar);
  const [name, setName] = useState(equipmentParaEditar?.name || '');
  const [code, setCode] = useState(equipmentParaEditar?.code || '');
  const [categoriaOpcao, setCategoriaOpcao] = useState(equipmentParaEditar?.type || 'LINHA_AMARELA');
  const [marca, setMarca] = useState(parsed.marca);
  const [model, setModel] = useState(parsed.modelo);
  const [serialNumber, setSerialNumber] = useState(equipmentParaEditar?.serial_number || '');
  const [hourmeter, setHourmeter] = useState<number>(equipmentParaEditar?.current_hourmeter ?? 0);
  const [potenciaHp, setPotenciaHp] = useState<number>(equipmentParaEditar?.potencia_hp ?? 0);
  const [combustivelPadrao, setCombustivelPadrao] = useState(equipmentParaEditar?.combustivel_padrao || 'DIESEL_S10');
  const [capacidadeTanque, setCapacidadeTanque] = useState<number>(equipmentParaEditar?.capacidade_tanque ?? 0);

  const [placa, setPlaca] = useState(equipmentParaEditar?.placa || '');
  const [tipoPropriedade, setTipoPropriedade] = useState<TipoPropriedadeEquipamento>(equipmentParaEditar?.tipo_propriedade || 'PROPRIO');
  const [fornecedorLocacao, setFornecedorLocacao] = useState(equipmentParaEditar?.fornecedor_locacao || '');
  const [valorLocacaoMensal, setValorLocacaoMensal] = useState<number>(equipmentParaEditar?.valor_locacao_mensal ?? 0);
  const [valorAquisicao, setValorAquisicao] = useState<number>(equipmentParaEditar?.valor_aquisicao ?? 0);
  const [custoHoraEstimado, setCustoHoraEstimado] = useState<number>(equipmentParaEditar?.custo_hora_estimado ?? 0);

  const [chassi, setChassi] = useState(equipmentParaEditar?.chassi || '');
  const [renavam, setRenavam] = useState(equipmentParaEditar?.renavam || '');
  const [anoFabricacao, setAnoFabricacao] = useState(equipmentParaEditar?.ano_fabricacao ? String(equipmentParaEditar.ano_fabricacao) : '');
  const [laudoArtValidade, setLaudoArtValidade] = useState(equipmentParaEditar?.laudo_art_validade || '');
  const [seguroApolice, setSeguroApolice] = useState(equipmentParaEditar?.seguro_apolice || '');
  const [seguroValidade, setSeguroValidade] = useState(equipmentParaEditar?.seguro_validade || '');
  const [tagRastreador, setTagRastreador] = useState(equipmentParaEditar?.tag_rastreador || '');
  const [arquivoFoto, setArquivoFoto] = useState<File | null>(null);
  const [driveUrlFoto, setDriveUrlFoto] = useState(equipmentParaEditar?.drive_url_foto || '');

  const [intervaloRevisao, setIntervaloRevisao] = useState<number>(0);
  const [descricaoRevisao, setDescricaoRevisao] = useState('Revisão periódica (óleo e filtros)');
  const [ultimaRevisao, setUltimaRevisao] = useState<number | null>(null);
  const unidadeKm = isVehicleOrTruck({ category: categoriaOpcao, type: categoriaOpcao, name, code });
  const ultimaRevisaoEfetiva = ultimaRevisao ?? (Number(hourmeter) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();
    setUpdateError(null);

    let urlFinal = driveUrlFoto;
    if (arquivoFoto) {
      setUploadingDrive(true);
      const res = await uploadParaGoogleDrive(arquivoFoto, 'frota');
      setUploadingDrive(false);
      if (!res.sucesso) {
        setUpdateError(`Falha no Google Drive: ${res.erro || 'Não foi possível enviar a foto'}`);
        return;
      }
      if (res.driveUrl) urlFinal = res.driveUrl;
    }

    const payload: any = {
      code: code || `EQ-${Date.now().toString().slice(-4)}`,
      name: name || (marca ? `${marca} ${model}`.trim() : model),
      category: (equipmentParaEditar?.category || 'HEAVY_MACHINERY') as import('../../../../types/equipment.types').EquipmentCategory,
      type: categoriaOpcao,
      marca: marca.trim() || undefined,
      model: model.trim(),
      serial_number: serialNumber,
      current_hourmeter: Number(hourmeter) || 0,
      potencia_hp: potenciaHp || undefined,
      combustivel_padrao: combustivelPadrao,
      capacidade_tanque: capacidadeTanque || undefined,
      placa: placa || undefined,
      tipo_propriedade: tipoPropriedade,
      fornecedor_locacao: fornecedorLocacao || undefined,
      valor_locacao_mensal: valorLocacaoMensal || undefined,
      valor_aquisicao: valorAquisicao || undefined,
      custo_hora_estimado: custoHoraEstimado || undefined,
      chassi: chassi || undefined,
      renavam: renavam || undefined,
      ano_fabricacao: anoFabricacao ? Number(anoFabricacao) : undefined,
      laudo_art_validade: laudoArtValidade || undefined,
      seguro_apolice: seguroApolice || undefined,
      seguro_validade: seguroValidade || undefined,
      tag_rastreador: tagRastreador || undefined,
      drive_url_foto: urlFinal || undefined
    };

    if (equipmentParaEditar?.id) {
      try {
        setIsUpdating(true);
        let { error: err } = await supabase.from('equipment').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', equipmentParaEditar.id);
        if (err && err.message.includes('marca')) {
          const { marca: _m, ...semMarca } = payload;
          const retry = await supabase.from('equipment').update({ ...semMarca, updated_at: new Date().toISOString() }).eq('id', equipmentParaEditar.id);
          err = retry.error;
        }
        if (err) throw err;
        onSuccess();
      } catch (err: unknown) {
        setUpdateError(err instanceof Error ? err.message : 'Erro ao atualizar equipamento');
      } finally {
        setIsUpdating(false);
      }
    } else {
      const result = await createEquipment(payload);
      if (result.success) {
        if (result.data) {
          await criarPlanoRevisaoInicial(result.data, {
            intervalo: intervaloRevisao, descricao: descricaoRevisao, ultimaLeitura: ultimaRevisaoEfetiva
          });
        }
        onSuccess();
      }
    }
  };

  return {
    state: {
      name, code, categoriaOpcao, marca, model, serialNumber, hourmeter, potenciaHp, combustivelPadrao, capacidadeTanque,
      placa, tipoPropriedade, fornecedorLocacao, valorLocacaoMensal, valorAquisicao, custoHoraEstimado,
      chassi, renavam, anoFabricacao, laudoArtValidade, seguroApolice, seguroValidade, tagRastreador, arquivoFoto, driveUrlFoto,
      intervaloRevisao, descricaoRevisao, ultimaRevisao: ultimaRevisaoEfetiva, unidadeKm
    },
    setters: {
      setName, setCode, setCategoriaOpcao, setMarca, setModel, setSerialNumber, setHourmeter, setPotenciaHp, setCombustivelPadrao, setCapacidadeTanque,
      setPlaca, setTipoPropriedade, setFornecedorLocacao, setValorLocacaoMensal, setValorAquisicao, setCustoHoraEstimado,
      setChassi, setRenavam, setAnoFabricacao, setLaudoArtValidade, setSeguroApolice, setSeguroValidade, setTagRastreador, setArquivoFoto, setDriveUrlFoto,
      setIntervaloRevisao, setDescricaoRevisao, setUltimaRevisao
    },
    isSubmitting: isCreating || isUpdating,
    uploadingDrive,
    error: createError || updateError,
    handleSubmit,
    isEdicao: Boolean(equipmentParaEditar?.id)
  };
}
