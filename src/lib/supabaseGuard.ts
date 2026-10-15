import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const MAX_STRING_LENGTH = 1500;

export function sanitizarDado(valor: unknown): unknown {
  if (typeof valor === 'string') {
    // Bloqueia qualquer data URI (base64 de imagem, pdf, binário)
    if (valor.startsWith('data:image/') || valor.startsWith('data:application/') || valor.startsWith('blob:')) {
      console.warn('[Supabase Guard] Base64/Blob bloqueado! Arquivos pesados devem ser salvos no Google Drive.');
      return null;
    }
    // Remove tags [FOTO:data:image...] caso venha em campos de texto/observações
    if (valor.includes('data:image/')) {
      const limpo = valor.replace(/\[FOTO:data:image\/[^\]]+\]/g, '').trim();
      return limpo.length === 0 ? null : limpo;
    }
    // Bloqueia strings anômalas gigantes sem espaços (típicas de base64 cru sem prefixo)
    if (valor.length > MAX_STRING_LENGTH && !valor.startsWith('http://') && !valor.startsWith('https://')) {
      if (!valor.includes(' ') && !valor.includes('\n')) {
        console.warn('[Supabase Guard] String pesada não-URL bloqueada para proteger cota de Egress.');
        return null;
      }
    }
    return valor;
  }

  if (Array.isArray(valor)) {
    return valor.map((item) => sanitizarDado(item));
  }

  if (valor !== null && typeof valor === 'object') {
    const obj = valor as Record<string, unknown>;
    const novoObj: Record<string, unknown> = {};
    for (const [chave, val] of Object.entries(obj)) {
      novoObj[chave] = sanitizarDado(val);
    }
    return novoObj;
  }

  return valor;
}

export function criarClienteSupabaseProtegido(url: string, key: string): SupabaseClient {
  const clienteOriginal = createClient(url, key);

  // Intercepta supabase.from(...) para garantir sanitização em insert, update e upsert
  const fromOriginal = clienteOriginal.from.bind(clienteOriginal);

  clienteOriginal.from = (table: string) => {
    const builder = fromOriginal(table);

    const insertOriginal = builder.insert.bind(builder);
    builder.insert = (values: any, options?: any) => {
      return insertOriginal(sanitizarDado(values) as any, options);
    };

    const updateOriginal = builder.update.bind(builder);
    builder.update = (values: any, options?: any) => {
      return updateOriginal(sanitizarDado(values) as any, options);
    };

    const upsertOriginal = builder.upsert.bind(builder);
    builder.upsert = (values: any, options?: any) => {
      return upsertOriginal(sanitizarDado(values) as any, options);
    };

    return builder;
  };

  // Bloqueio preventivo no Supabase Storage para evitar cobrança acidental
  if (clienteOriginal.storage) {
    const fromStorage = clienteOriginal.storage.from.bind(clienteOriginal.storage);
    clienteOriginal.storage.from = (id: string) => {
      const storageBuilder = fromStorage(id);
      storageBuilder.upload = async () => {
        const msg = '[Supabase Guard] Upload direto no Supabase Storage está bloqueado. Use o Google Drive.';
        console.error(msg);
        return { data: null, error: new Error(msg) as any };
      };
      return storageBuilder;
    };
  }

  return clienteOriginal;
}
