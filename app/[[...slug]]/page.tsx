import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lerPagina } from "@/lib/storage";
import { RenderPagina } from "@/components/RenderPagina";

// Páginas ficam em cache e são atualizadas quando a Pamela publica.
export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

type Params = { params: Promise<{ slug?: string[] }> };

function slugDe(partes?: string[]) {
  return (partes || []).join("/");
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const slug = slugDe((await params).slug);
  const data = await lerPagina(slug);
  const root = (data?.root?.props || {}) as { title?: string; descricao?: string };
  if (!data && slug !== "") return {};
  const titulo = root.title || "Pamela Burigo · fotografia";
  const descricao = root.descricao || "Esporte, eventos, retratos e trabalhos autorais.";
  const capa = encontrarPrimeiraImagem(data);
  return {
    title: titulo,
    description: descricao,
    openGraph: { title: titulo, description: descricao, images: capa ? [capa] : undefined, locale: "pt_BR", type: "website" },
  };
}

function encontrarPrimeiraImagem(data: unknown): string | undefined {
  let achada: string | undefined;
  const visitar = (v: unknown) => {
    if (achada || !v || typeof v !== "object") return;
    const o = v as Record<string, unknown>;
    if (typeof o.src === "string" && o.src.startsWith("http")) {
      achada = o.src;
      return;
    }
    Object.values(o).forEach(visitar);
  };
  visitar(data);
  return achada;
}

export default async function Pagina({ params }: Params) {
  const slug = slugDe((await params).slug);
  if (slug.includes("/")) notFound();
  const data = await lerPagina(slug);
  if (!data && slug !== "") notFound();
  return <RenderPagina data={data} />;
}
