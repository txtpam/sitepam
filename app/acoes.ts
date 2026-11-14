"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Data } from "@puckeditor/core";
import { COOKIE_SESSAO, criarToken, estaLogado, opcoesCookie, senhaConfigurada, senhaCorreta } from "@/lib/auth";
import { minutosBloqueado, registrarFalha, registrarSucesso } from "@/lib/limite-login";
import { sanitizarConteudo } from "@/lib/seguranca";
import { excluirPagina, lerPagina, salvarPagina, slugReservado, slugValido } from "@/lib/storage";

async function exigirLogin() {
  if (!(await estaLogado())) throw new Error("Sua sessão expirou. Entre novamente para continuar.");
}

export async function entrar(_: unknown, form: FormData) {
  if (!senhaConfigurada()) return { erro: "A senha de edição ainda não foi configurada na Vercel (ADMIN_PASSWORD)." };
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "desconhecido";

  const bloqueio = minutosBloqueado(ip);
  if (bloqueio > 0) {
    return { erro: `Muitas tentativas erradas. Tente de novo em ${bloqueio} ${bloqueio === 1 ? "minuto" : "minutos"}.` };
  }

  const senha = String(form.get("senha") || "");
  if (!senhaCorreta(senha)) {
    await new Promise((r) => setTimeout(r, 800));
    const { restantes, bloqueado } = registrarFalha(ip);
    if (bloqueado) return { erro: "Muitas tentativas erradas. O acesso foi bloqueado por 15 minutos." };
    return { erro: restantes <= 2 ? restantes === 1 ? "Senha incorreta. Resta 1 tentativa antes do bloqueio." : `Senha incorreta. Restam ${restantes} tentativas antes do bloqueio.` : "Senha incorreta." };
  }
  registrarSucesso(ip);
  const jar = await cookies();
  jar.set(COOKIE_SESSAO, criarToken(), opcoesCookie);
  redirect("/editar");
}

export async function sair() {
  const jar = await cookies();
  jar.delete(COOKIE_SESSAO);
  redirect("/entrar");
}

export async function publicar(slug: string, data: Data) {
  await exigirLogin();
  if (!slugValido(slug)) throw new Error("Endereço inválido.");
  if (!data || !Array.isArray(data.content)) throw new Error("Conteúdo inválido.");
  await salvarPagina(slug, sanitizarConteudo(data));
  revalidatePath(slug === "" ? "/" : `/${slug}`);
  return { ok: true, em: new Date().toISOString() };
}

export async function criarPagina(_: unknown, form: FormData) {
  await exigirLogin();
  const slug = String(form.get("slug") || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!slug) return { erro: "Escolha um endereço para a página." };
  if (!slugValido(slug) || slugReservado(slug)) return { erro: `O endereço "${slug}" não pode ser usado.` };
  if (await lerPagina(slug)) return { erro: `Já existe uma página em /${slug}.` };
  const titulo = String(form.get("titulo") || "").trim() || slug;
  redirect(`/editar/${slug}?novo=${encodeURIComponent(titulo)}`);
}

export async function apagarPagina(slug: string) {
  await exigirLogin();
  await excluirPagina(slug);
  revalidatePath(`/${slug}`);
  revalidatePath("/editar");
}
