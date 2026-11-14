import "server-only";

/**
 * Limite de tentativas de login por endereço IP.
 *
 * Depois de MAX_FALHAS senhas erradas, o IP fica bloqueado por BLOQUEIO_MS.
 * A contagem fica na memória do servidor: a Vercel reaproveita a mesma
 * instância entre requisições, então isso freia ataques de força bruta sem
 * depender de banco de dados (e sem gastar a cota do Blob). Não substitui uma
 * senha forte.
 */

const MAX_FALHAS = 5;
const JANELA_MS = 15 * 60 * 1000;
const BLOQUEIO_MS = 15 * 60 * 1000;
const MAX_REGISTROS = 5000;

type Registro = { falhas: number; primeira: number; bloqueadoAte: number };
const registros = new Map<string, Registro>();

function limpar(agora: number) {
  if (registros.size < MAX_REGISTROS) return;
  for (const [ip, r] of registros) {
    if (r.bloqueadoAte < agora && agora - r.primeira > JANELA_MS) registros.delete(ip);
  }
  // se ainda estiver cheio, descarta os mais antigos
  while (registros.size >= MAX_REGISTROS) {
    const primeiro = registros.keys().next().value;
    if (primeiro === undefined) break;
    registros.delete(primeiro);
  }
}

/** Minutos restantes de bloqueio (0 = liberado). */
export function minutosBloqueado(ip: string) {
  const r = registros.get(ip);
  const agora = Date.now();
  if (!r || r.bloqueadoAte <= agora) return 0;
  return Math.ceil((r.bloqueadoAte - agora) / 60000);
}

export function registrarFalha(ip: string) {
  const agora = Date.now();
  limpar(agora);
  let r = registros.get(ip);
  if (!r || agora - r.primeira > JANELA_MS) {
    r = { falhas: 0, primeira: agora, bloqueadoAte: 0 };
  }
  r.falhas += 1;
  if (r.falhas >= MAX_FALHAS) {
    r.bloqueadoAte = agora + BLOQUEIO_MS;
    r.falhas = 0;
    r.primeira = agora;
  }
  registros.set(ip, r);
  return { restantes: Math.max(0, MAX_FALHAS - r.falhas), bloqueado: r.bloqueadoAte > agora };
}

export function registrarSucesso(ip: string) {
  registros.delete(ip);
}
