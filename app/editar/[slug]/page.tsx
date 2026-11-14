import { notFound, redirect } from "next/navigation";
import { estaLogado } from "@/lib/auth";
import { lerPagina, slugValido, usandoBlob } from "@/lib/storage";
import { Editor } from "@/components/editor/Editor";
import "../../painel.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editando · Pamela Burigo", robots: { index: false } };

export default async function EditarPagina({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ novo?: string }>;
}) {
  if (!(await estaLogado())) redirect("/entrar");
  const { slug: bruto } = await params;
  const slug = bruto === "inicio" ? "" : bruto;
  if (!slugValido(slug)) notFound();

  const data = await lerPagina(slug);
  const { novo } = await searchParams;
  if (!data && slug !== "" && !novo) notFound();
  const inicio = data || slug === "" ? null : await lerPagina("");

  return <Editor slug={slug} dataInicial={data} tituloNovo={novo || null} inicio={inicio} uploadBlob={usandoBlob()} />;
}
