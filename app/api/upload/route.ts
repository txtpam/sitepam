import { NextResponse } from "next/server";
import { issueSignedToken } from "@vercel/blob";
import {
  handleUpload,
  handleUploadPresigned,
  type HandleUploadBody,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { estaLogado } from "@/lib/auth";
import { modoUpload, salvarArquivoLocal } from "@/lib/storage";

// SVG fica de fora: pode conter código e fotografias não usam esse formato.
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAXIMO = 40 * 1024 * 1024;

function destinoValido(pathname: string) {
  if (!pathname.startsWith("fotos/") || pathname.includes("..")) throw new Error("Destino inválido.");
}

export async function POST(request: Request) {
  if (!(await estaLogado())) {
    return NextResponse.json({ erro: "Sessão expirada. Entre novamente." }, { status: 401 });
  }

  const modo = modoUpload();

  // Conexão nova da Vercel (BLOB_STORE_ID): o navegador recebe uma URL assinada e envia direto ao Blob.
  if (modo === "presigned") {
    try {
      const body = (await request.json()) as HandleUploadPresignedBody;
      const resposta = await handleUploadPresigned({
        body,
        request,
        getSignedToken: async (pathname) => {
          destinoValido(pathname);
          const token = await issueSignedToken({
            pathname,
            operations: ["put"],
            allowedContentTypes: TIPOS,
            maximumSizeInBytes: MAXIMO,
            validUntil: Date.now() + 15 * 60 * 1000,
          });
          return {
            token,
            urlOptions: { allowedContentTypes: TIPOS, maximumSizeInBytes: MAXIMO, addRandomSuffix: true },
          };
        },
      });
      return NextResponse.json(resposta);
    } catch (e) {
      console.error("Falha ao autorizar envio (presigned):", e);
      return NextResponse.json({ erro: (e as Error).message }, { status: 400 });
    }
  }

  // Conexão antiga da Vercel (BLOB_READ_WRITE_TOKEN).
  if (modo === "token") {
    try {
      const body = (await request.json()) as HandleUploadBody;
      const resposta = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (pathname) => {
          destinoValido(pathname);
          return { allowedContentTypes: TIPOS, maximumSizeInBytes: MAXIMO, addRandomSuffix: true };
        },
      });
      return NextResponse.json(resposta);
    } catch (e) {
      console.error("Falha ao autorizar envio (token):", e);
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
