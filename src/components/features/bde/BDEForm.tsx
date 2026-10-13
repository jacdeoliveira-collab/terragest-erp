import React from 'react';
import { AlertCircle, HardHat, Gauge, Compass, Check } from 'lucide-react';
import { BDEDadosIniciaisTab } from './BDEDadosIniciaisTab';
import { BDEHorimetrosTab } from './BDEHorimetrosTab';
import { BDELocalizacaoTab } from './BDELocalizacaoTab';
import { PinPadModal } from '../../ui/PinPadModal';
import { useBDEFormState } from './useBDEFormState';

interface BDEFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const BDEForm: React.FC<BDEFormProps> = ({ onSuccess, onCancel }) => {
  const form = useBDEFormState(onSuccess);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.limparErro();
    if (!form.obraId) return alert('Por favor, selecione uma obra ativa.');
    if (!form.equipmentId) return alert('Por favor, selecione o equipamento.');
    if (form.finalHourmeter < form.initialHourmeter) return alert('Horímetro final menor que inicial.');
    if (form.horasOciosas > 0 && !form.motivoParada) {
      form.setActiveTab('horimetros');
      return alert('Informe o motivo da parada/ociosidade.');
    }
    if (form.selectedFunc?.pin_assinatura) {
      form.setShowPinModal(true);
    } else {
      form.executarSalvar();
    }
  };

  const tabs = [
    { id: 'dados' as const, label: '1. Dados & Obra', icon: HardHat },
    { id: 'horimetros' as const, label: '2. Horímetros & Produção', icon: Gauge },
    { id: 'localizacao' as const, label: '3. Estacas & Atividades', icon: Compass }
  ];

  return (
    <>
      <form onSubmit={handleSubmit} className="text-left space-y-4">
        {form.error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{form.error}</span>
          </div>
        )}

        <div className="flex border-b border-gray-200 bg-gray-50/70 rounded-xl p-1 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = form.activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => form.setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isActive ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="min-h-[220px]">
          {form.activeTab === 'dados' && (
            <BDEDadosIniciaisTab
              equipmentId={form.equipmentId} setEquipmentId={form.setEquipmentId}
              operadorId={form.operadorId} setOperadorId={form.setOperadorId}
              obraId={form.obraId} setObraId={form.setObraId}
              date={form.date} setDate={form.setDate}
              onEquipmentSelect={form.handleEquipmentSelect}
            />
          )}
          {form.activeTab === 'horimetros' && (
            <BDEHorimetrosTab
              initialHourmeter={form.initialHourmeter} setInitialHourmeter={form.setInitialHourmeter}
              finalHourmeter={form.finalHourmeter} setFinalHourmeter={form.setFinalHourmeter}
              horasProdutivas={form.horasProdutivas} setHorasProdutivas={form.setHorasProdutivas}
              horasOciosas={form.horasOciosas} setHorasOciosas={form.setHorasOciosas}
              motivoParada={form.motivoParada} setMotivoParada={form.setMotivoParada}
              selectedEquip={form.selectedEquip}
            />
          )}
          {form.activeTab === 'localizacao' && (
            <BDELocalizacaoTab
              estacaInicial={form.estacaInicial} setEstacaInicial={form.setEstacaInicial}
              estacaFinal={form.estacaFinal} setEstacaFinal={form.setEstacaFinal}
              description={form.description} setDescription={form.setDescription}
              notes={form.notes} setNotes={form.setNotes}
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={form.isSubmitting || !form.equipmentId}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{form.isSubmitting ? 'Salvando...' : 'Salvar Boletim'}</span>
          </button>
        </div>
      </form>

      <PinPadModal
        isOpen={form.showPinModal} onClose={() => form.setShowPinModal(false)}
        onSuccess={form.executarSalvar} operadorNome={form.selectedFunc?.nome || 'Operador'}
        expectedPin={form.selectedFunc?.pin_assinatura} tituloAcao="Assinatura Eletrônica do BDE"
      />
    </>
  );
};
