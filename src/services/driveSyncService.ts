import { supabase } from '../lib/supabase';
import { obterComprovante } from './comprovanteStorageService';
import { uploadParaGoogleDrive } from './driveService';

function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export async function sincronizarFotosHorimetroPendentes(): Promise<{ sincronizadas: number }> {
  let sincronizadas = 0;
  if (typeof window === 'undefined') return { sincronizadas: 0 };

  const localToken = localStorage.getItem('terragest_google_drive_token');
  const tokenTime = localStorage.getItem('terragest_google_drive_token_time');
  if (!localToken || !tokenTime || Date.now() - Number(tokenTime) > 3000 * 1000) {
    return { sincronizadas: 0 };
  }

  try {
    const { data: srvs, error } = await supabase
      .from('servicos_horimetro')
      .select('id, foto_horimetro_inicial, foto_horimetro_final, maquinas_itens')
      .or('foto_horimetro_inicial.ilike.idb://%,foto_horimetro_final.ilike.idb://%')
      .limit(20);

    if (error || !srvs || srvs.length === 0) return { sincronizadas: 0 };

    for (const srv of srvs) {
      let precisaAtualizar = false;
      let novaFotoIni = srv.foto_horimetro_inicial;
      let novaFotoFim = srv.foto_horimetro_final;

      if (srv.foto_horimetro_inicial?.startsWith('idb://')) {
        const dadosBase64 = await obterComprovante(srv.foto_horimetro_inicial);
        if (dadosBase64 && dadosBase64.length > 100) {
          try {
            const file = base64ToFile(dadosBase64, `horimetro_ini_${srv.id}.jpg`);
            const res = await uploadParaGoogleDrive(file, 'frota');
            if (res.sucesso && res.driveUrl) {
              novaFotoIni = res.driveUrl;
              precisaAtualizar = true;
            }
          } catch {}
        }
      }

      if (srv.foto_horimetro_final?.startsWith('idb://')) {
        const dadosBase64 = await obterComprovante(srv.foto_horimetro_final);
        if (dadosBase64 && dadosBase64.length > 100) {
          try {
            const file = base64ToFile(dadosBase64, `horimetro_fim_${srv.id}.jpg`);
            const res = await uploadParaGoogleDrive(file, 'frota');
            if (res.sucesso && res.driveUrl) {
              novaFotoFim = res.driveUrl;
              precisaAtualizar = true;
            }
          } catch {}
        }
      }

      if (precisaAtualizar) {
        const payloadUpdate: Record<string, any> = {
          foto_horimetro_inicial: novaFotoIni,
          foto_horimetro_final: novaFotoFim
        };

        if (Array.isArray(srv.maquinas_itens) && srv.maquinas_itens.length > 0) {
          payloadUpdate.maquinas_itens = srv.maquinas_itens.map((m: any, idx: number) => {
            if (idx === 0) {
              return { ...m, foto_horimetro_inicial: novaFotoIni, foto_horimetro_final: novaFotoFim };
            }
            return m;
          });
        }

        const { error: updErr } = await supabase
          .from('servicos_horimetro')
          .update(payloadUpdate)
          .eq('id', srv.id);

        if (!updErr) sincronizadas++;
      }
    }
  } catch {}

  return { sincronizadas };
}
