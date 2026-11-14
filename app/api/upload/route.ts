import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { estaLogado } from "@/lib/auth";
import { salvarArquivoLocal, usandoBlob } from "@/lib/storage";

const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];
const MAXIMO = 40 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await estaLogado())) {
    return NextResponse.json({ erro: "Sessão expirada. Entre novamente." }, { status: 401 });
  }

  // Produção: o navegador envia direto para o Vercel Blob; aqui só geramos a autorização.
  if (usandoBlob()) {
    try {
      const body = (await request.json()) as HandleUploadBody;
      const resposta = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (pathname) => {
          if (!pathname.startsWith("fotos/")) throw new Error("Destino inválido.");
          return { allowedContentTypes: TIPOS, maximumSizeInBytes: MAXIMO, addRandomSuffix: true };
        },
      });
      return NextResponse.json(resposta);
    } catch (e) {
      return NextResponse.json({ erro: (e as Error).message }, { status: 400 });
    }
  }

  // Desenvolvimento local: grava em .data/uploads
  const form = await request.formData();
  const arquivo = form.get("arquivo");
  if (!(arquivo instanceof File)) return NextResponse.json({ erro: "Nenhum arquivo." }, { status: 400 });
  if (!TIPOS.includes(arquivo.type)) return NextResponse.json({ erro: "Formato não suportado." }, { status: 400 });
  const nome = `${Date.now().toString(36)}-${arquivo.name.replace(/[^\w.-]/g, "")}`;
  const url = await salvarArquivoLocal(nome, Buffer.from(await arquivo.arrayBuffer()));
  return NextResponse.json({ url });
}
