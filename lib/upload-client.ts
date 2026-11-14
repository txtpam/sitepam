"use client";

import { upload, uploadPresigned } from "@vercel/blob/client";
import type { Imagem } from "@/components/blocos/comum";

const LADO_MAXIMO = 2400; // px — suficiente para telas grandes, leve para o site
const QUALIDADE = 0.86;

type ModoUpload = "token" | "presigned" | "local";
let modo: ModoUpload = "local";
export function configurarUpload(opts: { modo: ModoUpload }) {
  modo = opts.modo;
}

/** Reduz a foto no navegador antes de enviar (fotos de câmera chegam a 20+ MB). */
async function preparar(arquivo: File): Promise<{ arquivo: Blob; nome: string; largura: number; altura: number }> {
  const base = arquivo.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "foto";

  if (arquivo.type === "image/gif") {
    return { arquivo, nome: `${base}.gif`, largura: 0, altura: 0 };
  }

  const bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  // PNG pequeno (ex.: arte com transparência) segue como está
  if (arquivo.type === "image/png" && escala === 1 && arquivo.size < 1.5 * 1024 * 1024) {
    bitmap.close();
    return { arquivo, nome: `${base}.png`, largura, altura };
  }

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();
  const blob: Blob = await new Promise((ok, erro) =>
    canvas.toBlob((b) => (b ? ok(b) : erro(new Error("Não foi possível processar a imagem."))), "image/jpeg", QUALIDADE),
  );
  return { arquivo: blob, nome: `${base}.jpg`, largura, altura };
}

export async function enviarFoto(arquivo: File): Promise<Imagem> {
  if (!arquivo.type.startsWith("image/")) throw new Error(`"${arquivo.name}" não é uma imagem.`);
  if (arquivo.type === "image/svg+xml") throw new Error(`"${arquivo.name}" é SVG. Envie a foto em JPG, PNG ou WEBP.`);
  const p = await preparar(arquivo);

  if (modo !== "local") {
    const enviar = modo === "presigned" ? uploadPresigned : upload;
    const r = await enviar(`fotos/${p.nome}`, p.arquivo, {
      access: "public",
      handleUploadUrl: "/api/upload",
      contentType: p.arquivo.type || "image/jpeg",
      multipart: p.arquivo.size > 8 * 1024 * 1024,
    });
    return { src: r.url, largura: p.largura || undefined, altura: p.altura || undefined };
  }

  const form = new FormData();
  form.append("arquivo", p.arquivo, p.nome);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.erro || "Falha ao enviar a foto.");
  return { src: json.url, largura: p.largura || undefined, altura: p.altura || undefined };
}

/** Envia várias fotos, 3 por vez, informando o progresso. */
export async function enviarFotos(arquivos: File[], aoProgredir?: (feitas: number, total: number) => void) {
  const resultado: (Imagem | null)[] = new Array(arquivos.length).fill(null);
  const erros: string[] = [];
  let feitas = 0;
  let proximo = 0;
  const trabalhar = async () => {
    while (proximo < arquivos.length) {
      const i = proximo++;
      try {
        resultado[i] = await enviarFoto(arquivos[i]);
      } catch (e) {
        erros.push(e instanceof Error ? e.message : String(e));
      }
      aoProgredir?.(++feitas, arquivos.length);
    }
  };
  await Promise.all([trabalhar(), trabalhar(), trabalhar()]);
  return { imagens: resultado.filter(Boolean) as Imagem[], erros };
}
