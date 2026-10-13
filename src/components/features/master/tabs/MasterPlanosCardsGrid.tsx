import React from 'react';
import type { TipoPlanoTenant } from '../../../../types/tenant.types';
import { PlanCardItem } from '../components/PlanCardItem';

interface MasterPlanosCardsGridProps {
  planoAtual: TipoPlanoTenant;
  onSelectPlano: (plano: TipoPlanoTenant) => void;
}

export const MasterPlanosCardsGrid: React.FC<MasterPlanosCardsGridProps> = ({
  planoAtual,
  onSelectPlano,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <PlanCardItem
        id="START"
        nome="Plano Essencial"
        preco="R$ 499,00/mês"
        subtitulo="Ideal para empreiteiras e equipes operacionais enxutas"
        recursos={[
          'Até 10 equipamentos cadastrados',
          'Até 2 usuários e apontadores simultâneos',
          'Boletim Diário de Equipamento (BDE)',
          'Relatórios operacionais em PDF/Excel',
        ]}
        isAtual={planoAtual === 'START'}
        onSelect={onSelectPlano}
      />
      <PlanCardItem
        id="PRO"
        nome="Plano Operacional"
        preco="R$ 1.250,00/mês"
        subtitulo="Mais balanceado com frotas ativas, estoque e comboio"
        recursos={[
          'Até 30 máquinas/caminhões cadastrados',
          'Até 8 usuários sem papel para operadores',
          'Módulo de Almoxarifado & Peças',
          'Gestão de Diesel e Abastecimento Móvel',
          'Suporte prioritário via WhatsApp',
        ]}
        isAtual={planoAtual === 'PRO'}
        onSelect={onSelectPlano}
      />
      <PlanCardItem
        id="ENTERPRISE"
        nome="Plano Master / Enterprise"
        preco="R$ 2.500,00/mês"
        subtitulo="Solução completa para grandes grupos agro e obras pesadas"
        recursos={[
          'Equipamentos e frotas ilimitadas',
          'Obras e contratos sem restrição',
          'Módulo Financeiro, DAE e RH Fiscal',
          'Auditoria SaaS e Onboarding VIP 24/7',
        ]}
        isAtual={planoAtual === 'ENTERPRISE'}
        onSelect={onSelectPlano}
      />
    </div>
  );
};
