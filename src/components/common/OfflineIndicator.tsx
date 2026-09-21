import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useOfflineStatus();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all ${
        isOnline
          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
          : 'bg-amber-950/40 text-amber-400 border-amber-800/60 animate-pulse'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sincronizado (Online)</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>Modo Campo (Offline)</span>
        </>
      )}
    </div>
  );
};
