import React from 'react';
import { Sun, Moon, Eye, Type, ALargeSmall } from 'lucide-react';
import {
  useAppearance,
  type AppThemeMode,
  type AppFontSize,
  type AppFontFamily,
} from '../../contexts/AppearanceContext';

const THEME_OPTIONS: { id: AppThemeMode; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'light', label: 'Claro', icon: Sun, desc: 'Padrão limpo' },
  { id: 'dark', label: 'Escuro', icon: Moon, desc: 'Conforto noturno' },
  { id: 'solar', label: 'Sol Forte', icon: Eye, desc: 'Alto contraste (Campo)' },
];

const SIZE_OPTIONS: { id: AppFontSize; label: string; badge: string }[] = [
  { id: 'normal', label: 'Normal', badge: 'A' },
  { id: 'large', label: 'Grande', badge: 'A+' },
  { id: 'xlarge', label: 'Extra', badge: 'A++' },
];

const FONT_OPTIONS: { id: AppFontFamily; label: string }[] = [
  { id: 'default', label: 'Padrão' },
  { id: 'rounded', label: 'Nítida' },
  { id: 'mono', label: 'Técnica' },
];

export const HeaderAppearanceSection: React.FC = () => {
  const { theme, fontSize, fontFamily, setTheme, setFontSize, setFontFamily } = useAppearance();

  return (
    <div className="p-3 bg-slate-50/80 border-b border-slate-200 space-y-2.5 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          Aparência & Leitura
        </span>
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600">
          {theme === 'dark' ? 'Modo Escuro' : theme === 'solar' ? 'Alto Contraste' : 'Modo Claro'}
        </span>
      </div>

      {/* 1. Modo de Tela (Claro / Escuro / Sol Forte) */}
      <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-xl">
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              title={opt.desc}
              onClick={() => setTheme(opt.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                active
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Tamanho da Letra */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1 shrink-0">
          <ALargeSmall className="w-3.5 h-3.5 text-blue-600" />
          Letra:
        </span>
        <div className="grid grid-cols-3 gap-1 flex-1 bg-slate-200/70 p-0.5 rounded-lg">
          {SIZE_OPTIONS.map((sz) => {
            const active = fontSize === sz.id;
            return (
              <button
                key={sz.id}
                type="button"
                onClick={() => setFontSize(sz.id)}
                className={`py-1 px-1.5 rounded-md font-bold text-[10px] transition-all cursor-pointer ${
                  active
                    ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sz.badge} {sz.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Fonte do Sistema */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1 shrink-0">
          <Type className="w-3.5 h-3.5 text-emerald-600" />
          Fonte:
        </span>
        <div className="grid grid-cols-3 gap-1 flex-1 bg-slate-200/70 p-0.5 rounded-lg">
          {FONT_OPTIONS.map((fn) => {
            const active = fontFamily === fn.id;
            return (
              <button
                key={fn.id}
                type="button"
                onClick={() => setFontFamily(fn.id)}
                className={`py-1 px-1.5 rounded-md font-bold text-[10px] transition-all cursor-pointer ${
                  active
                    ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {fn.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

