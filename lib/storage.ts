import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { list, put, del } from "@vercel/blob";
import type { Data } from "@puckeditor/core";

/**
 * Armazenamento das páginas do site.
 *
 * - Em produção (Vercel): Vercel Blob. Cada publicação grava um arquivo novo
 *   (paginas/<chave>/v-<timestamp>.json), o que evita cache desatualizado e
 *   mantém um histórico das últimas versões.
 * - Em desenvolvimento sem BLOB_READ_WRITE_TOKEN: pasta local .data/.
 */

const MAX_VERSOES = 15;
const LOCAL_DIR = path.join(process.cwd(), ".data");

export const usandoBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

/**
 * Como o navegador envia fotos ao Blob:
 * - "token": conexão antiga da Vercel (BLOB_READ_WRITE_TOKEN)
 * - "presigned": conexão nova da Vercel (BLOB_STORE_ID + OIDC automático)
 * - "local": desenvolvimento, sem Blob
 */
export type ModoUpload = "token" | "presigned" | "local";
export function modoUpload(): ModoUpload {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "token";
  if (process.env.BLOB_STORE_ID) return "presigned";
  return "local";
}

export type InfoPagina = {
  slug: string; // "" para a página inicial
  titulo: string;
  atualizadoEm: string;
};

/** "" (início) -> "_inicio"; "sobre" -> "sobre" */
function chave(slug: string) {
  return slug === "" ? "_inicio" : slug;
}
function slugDaChave(k: string) {
  return k === "_inicio" ? "" : k;
}

export function slugValido(slug: string) {
  return slug === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

const RESERVADOS = new Set(["inicio", "editar", "entrar", "sair", "api", "media", "_next"]);
export function slugReservado(slug: string) {
  return RESERVADOS.has(slug);
}

// ---------------------------------------------------------------- Blob

async function versoesBlob(slug: string) {
  const prefix = `paginas/${chave(slug)}/`;
  const blobs: { url: string; pathname: string; uploadedAt: Date }[] = [];
  let cursor: string | undefined;
  do {
    const r = await list({ prefix, cursor, limit: 1000 });
    blobs.push(...r.blobs);
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  return blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
}

// ---------------------------------------------------------------- API

export async function lerPagina(slug: string): Promise<Data | null> {
  if (!slugValido(slug)) return null;
  if (usandoBlob()) {
    const [ultima] = await versoesBlob(slug);
    if (!ultima) return null;
    const res = await fetch(ultima.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Data;
  }
  try {
    const txt = await fs.readFile(path.join(LOCAL_DIR, "paginas", `${chave(slug)}.json`), "utf8");
    return JSON.parse(txt) as Data;
  } catch {
    return null;
  }
}

export async function salvarPagina(slug: string, data: Data) {
  if (!slugValido(slug)) throw new Error("Endereço de página inválido.");
  const json = JSON.stringify(data);
  if (usandoBlob()) {
    const nome = `paginas/${chave(slug)}/v-${Date.now().toString().padStart(15, "0")}.json`;
    await put(nome, json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    const versoes = await versoesBlob(slug);
    const antigas = versoes.slice(MAX_VERSOES).map((b) => b.url);
    if (antigas.length) await del(antigas);
    return;
  }
  await fs.mkdir(path.join(LOCAL_DIR, "paginas"), { recursive: true });
  await fs.writeFile(path.join(LOCAL_DIR, "paginas", `${chave(slug)}.json`), json, "utf8");
}

export async function excluirPagina(slug: string) {
  if (slug === "") throw new Error("A página inicial não pode ser excluída.");
  if (usandoBlob()) {
    const versoes = await versoesBlob(slug);
    if (versoes.length) await del(versoes.map((b) => b.url));
    return;
  }
  await fs.rm(path.join(LOCAL_DIR, "paginas", `${chave(slug)}.json`), { force: true });
}

export async function listarPaginas(): Promise<InfoPagina[]> {
  const ultimas = new Map<string, Date>();
  if (usandoBlob()) {
    let cursor: string | undefined;
    do {
      const r = await list({ prefix: "paginas/", cursor, limit: 1000 });
      for (const b of r.blobs) {
        const k = b.pathname.split("/")[1];
        const atual = ultimas.get(k);
        if (!atual || b.uploadedAt > atual) ultimas.set(k, b.uploadedAt);
      }
      cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor);
  } else {
    try {
      const dir = path.join(LOCAL_DIR, "paginas");
      for (const f of await fs.readdir(dir)) {
        if (!f.endsWith(".json")) continue;
        const st = await fs.stat(path.join(dir, f));
        ultimas.set(f.replace(/\.json$/, ""), st.mtime);
      }
    } catch {
      /* pasta ainda não existe */
    }
  }

  const paginas = await Promise.all(
    [...ultimas.entries()].map(async ([k, data]) => {
      const slug = slugDaChave(k);
      const conteudo = await lerPagina(slug);
      const titulo = (conteudo?.root?.props as { title?: string } | undefined)?.title;
      return { slug, titulo: titulo || (slug === "" ? "Início" : slug), atualizadoEm: data.toISOString() };
    }),
  );
  return paginas.sort((a, b) => (a.slug === "" ? -1 : b.slug === "" ? 1 : a.slug.localeCompare(b.slug)));
}

// ------------------------------------------------- Uploads locais (dev)

export async function salvarArquivoLocal(nome: string, conteudo: Buffer) {
  const dir = path.join(LOCAL_DIR, "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, nome), conteudo);
  return `/media/${nome}`;
}

export async function lerArquivoLocal(nome: string) {
  if (!/^[\w.-]+$/.test(nome)) return null;
  try {
    return await fs.readFile(path.join(LOCAL_DIR, "uploads", nome));
  } catch {
    return null;
  }
}
