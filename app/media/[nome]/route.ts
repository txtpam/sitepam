import { lerArquivoLocal } from "@/lib/storage";

const TIPOS: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  avif: "image/avif",
};

/** Serve as fotos enviadas em desenvolvimento local (sem Vercel Blob). */
export async function GET(_: Request, { params }: { params: Promise<{ nome: string }> }) {
  const { nome } = await params;
  const arquivo = await lerArquivoLocal(nome);
  if (!arquivo) return new Response("Não encontrado", { status: 404 });
  const ext = nome.split(".").pop()?.toLowerCase() || "";
  return new Response(new Uint8Array(arquivo), {
    headers: { "Content-Type": TIPOS[ext] || "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
