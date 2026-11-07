import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

export const CURRENT_APP_VERSION = '1.0.0';
const PROD_BASE_URL = 'https://terragest.agrodronesma.com.br';
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

export interface VersionData {
  version: string;
  changelog: string;
  apkUrl: string;
}

function isRemoteNewer(current: string, remote: string): boolean {
  if (!remote || current === remote) return false;
  const cParts = current.split('.').map((n) => parseInt(n, 10) || 0);
  const rParts = remote.split('.').map((n) => parseInt(n, 10) || 0);
  const maxLen = Math.max(cParts.length, rParts.length);

  for (let i = 0; i < maxLen; i++) {
    const c = cParts[i] || 0;
    const r = rParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return remote.trim() !== current.trim();
}

export function useVersionCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionData | null>(null);
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);

  const isNativeApk = Capacitor.isNativePlatform();

  const checkVersion = useCallback(async () => {
    try {
      const ts = Date.now();
      const endpoint = isNativeApk
        ? `${PROD_BASE_URL}/version.json?t=${ts}`
        : `/version.json?t=${ts}`;

      const response = await fetch(endpoint, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) return;
      const data: VersionData = await response.json();

      if (data?.version && isRemoteNewer(CURRENT_APP_VERSION, data.version)) {
        if (dismissedVersion !== data.version) {
          setVersionInfo(data);
          setUpdateAvailable(true);
        }
      } else {
        setUpdateAvailable(false);
      }
    } catch {
      // Silencioso em caso de queda temporária de rede em campo
    }
  }, [isNativeApk, dismissedVersion]);

  useEffect(() => {
    checkVersion();

    const timer = setInterval(checkVersion, CHECK_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };

    window.addEventListener('focus', checkVersion);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', checkVersion);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [checkVersion]);

  const dismissUpdate = () => {
    if (versionInfo?.version) {
      setDismissedVersion(versionInfo.version);
    }
    setUpdateAvailable(false);
  };

  return {
    updateAvailable,
    currentVersion: CURRENT_APP_VERSION,
    versionInfo,
    isNativeApk,
    dismissUpdate,
    checkVersion
  };
}

