/**
 * Proteções de conteúdo usadas no site e na publicação.
 * (Sem "server-only": linkSeguro também roda no navegador.)
 */

/** Aceita apenas links comuns: http(s), caminhos do site, âncoras, e-mail e telefone. */
export function linkSeguro(link?: string | null): string | undefined {
  if (!link) return undefined;
  const l = String(link).trim();
  if (!l) return undefined;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(l)) return l;
  if (/^[/#?]/.test(l) && !l.startsWith("//")) return l;
  // texto sem protocolo, ex.: "instagram.com/pb.picx" -> https://
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(l)) return `https://${l}`;
  return undefined; // javascript:, data:, vbscript: etc. são descartados
}

// blocos inteiros (tag + conteúdo) e, depois, tags soltas que sobrarem
const RE_BLOCO = /<\s*(script|iframe|object|embed|style|form)\b[\s\S]*?<\s*\/\s*\1\s*>/gi;
const RE_TAG_SOLTA = /<\s*\/?\s*(script|iframe|object|embed|style|link|meta|base|form)\b[^>]*>/gi;
const RE_EVENTO = /\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const RE_URL_PERIGOSA = /(href|src|xlink:href|action|formaction)\s*=\s*("|')?\s*(javascript|vbscript|data):[^"'\s>]*\2?/gi;

/** Remove código executável de um texto/HTML (tags de script, eventos on*, URLs javascript:). */
export function limparTexto(texto: string): string {
  if (!/[<:]/.test(texto)) return texto;
  return texto.replace(RE_BLOCO, "").replace(RE_TAG_SOLTA, "").replace(RE_EVENTO, "").replace(RE_URL_PERIGOSA, '$1="#"');
}

const CAMPOS_LINK = new Set(["link", "url", "href"]);

/**
 * Percorre todo o conteúdo de uma página antes de salvar:
 * limpa HTML dos textos e descarta links perigosos.
 */
export function sanitizarConteudo<T>(valor: T, chave = ""): T {
  if (typeof valor === "string") {
    if (CAMPOS_LINK.has(chave)) return (linkSeguro(valor) ?? "") as T;
    if (chave === "src") return (/^(https:\/\/|\/media\/)/.test(valor) ? valor : "") as T;
    return limparTexto(valor) as T;
  }
  if (Array.isArray(valor)) return valor.map((v) => sanitizarConteudo(v, chave)) as T;
  if (valor && typeof valor === "object") {
    const saida: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor as Record<string, unknown>)) saida[k] = sanitizarConteudo(v, k);
    return saida as T;
  }
  return valor;
}
