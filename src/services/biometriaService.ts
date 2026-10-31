interface TerraGestBiometricsNative {
  isAvailable: () => boolean;
  hasSavedCredentials: () => boolean;
  getSavedEmail: () => string;
  saveCredentials: (email: string, password: string) => void;
  clearCredentials: () => void;
  authenticate: () => void;
}

declare global {
  interface Window {
    TerraGestBiometrics?: TerraGestBiometricsNative;
    onTerraGestBiometricSuccess?: (email: string, password: string) => void;
    onTerraGestBiometricError?: (msg: string) => void;
  }
}

const WEB_VAULT_KEY = 'terragest_webauthn_vault';

function getNativeBridge(): TerraGestBiometricsNative | undefined {
  return typeof window !== 'undefined' ? window.TerraGestBiometrics : undefined;
}

export async function verificarBiometriaDisponivel(): Promise<boolean> {
  const native = getNativeBridge();
  if (native) {
    try {
      return Boolean(native.isAvailable());
    } catch {
      return false;
    }
  }
  if (typeof window !== 'undefined' && window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable) {
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }
  return false;
}

export function possuiBiometriaSalva(): boolean {
  const native = getNativeBridge();
  if (native) {
    try {
      return Boolean(native.hasSavedCredentials());
    } catch {
      return false;
    }
  }
  if (typeof window !== 'undefined') {
    return Boolean(localStorage.getItem(WEB_VAULT_KEY));
  }
  return false;
}

export function obterEmailBiometriaSalva(): string {
  const native = getNativeBridge();
  if (native) {
    try {
      return native.getSavedEmail() || '';
    } catch {
      return '';
    }
  }
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(WEB_VAULT_KEY);
      if (!raw) return '';
      const parsed = JSON.parse(atob(raw));
      return parsed.email || '';
    } catch {
      return '';
    }
  }
  return '';
}

export async function salvarCredenciaisBiometria(email: string, password: string): Promise<void> {
  const native = getNativeBridge();
  if (native) {
    native.saveCredentials(email.trim(), password);
    return;
  }
  if (typeof window !== 'undefined') {
    const payload = btoa(JSON.stringify({ email: email.trim(), password }));
    localStorage.setItem(WEB_VAULT_KEY, payload);
  }
}

export function limparCredenciaisBiometria(): void {
  const native = getNativeBridge();
  if (native) {
    native.clearCredentials();
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(WEB_VAULT_KEY);
  }
}

export function autenticarComBiometria(): Promise<{ email: string; password: string }> {
  return new Promise((resolve, reject) => {
    const native = getNativeBridge();
    if (native) {
      window.onTerraGestBiometricSuccess = (email: string, password: string) => {
        resolve({ email, password });
      };
      window.onTerraGestBiometricError = (msg: string) => {
        reject(new Error(msg || 'Autenticação biométrica cancelada'));
      };
      native.authenticate();
      return;
    }

    const raw = typeof window !== 'undefined' ? localStorage.getItem(WEB_VAULT_KEY) : null;
    if (!raw) {
      reject(new Error('Nenhuma credencial vinculada à biometria neste aparelho.'));
      return;
    }
    try {
      const parsed = JSON.parse(atob(raw));
      resolve({ email: parsed.email, password: parsed.password });
    } catch {
      reject(new Error('Falha ao ler credencial biométrica.'));
    }
  });
}

