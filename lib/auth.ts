import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE_SESSAO = "pb_sessao";
const DURACAO_DIAS = 30;

function segredo() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

export const senhaConfigurada = () => Boolean(process.env.ADMIN_PASSWORD);

function assinar(valor: string) {
  return createHmac("sha256", segredo()).update(valor).digest("hex");
}

function iguais(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function senhaCorreta(senha: string) {
  const esperada = process.env.ADMIN_PASSWORD;
  if (!esperada) return false;
  // compara hashes para não vazar o tamanho da senha
  return iguais(assinar(`senha:${senha}`), assinar(`senha:${esperada}`));
}

export function criarToken() {
  const expira = Date.now() + DURACAO_DIAS * 24 * 60 * 60 * 1000;
  const corpo = `admin.${expira}`;
  return `${corpo}.${assinar(corpo)}`;
}

export function tokenValido(token: string | undefined) {
  if (!token || !senhaConfigurada()) return false;
  const partes = token.split(".");
  if (partes.length !== 3) return false;
  const [quem, expira, assinatura] = partes;
  if (quem !== "admin" || Number(expira) < Date.now()) return false;
  return iguais(assinatura, assinar(`${quem}.${expira}`));
}

export async function estaLogado() {
  const jar = await cookies();
  return tokenValido(jar.get(COOKIE_SESSAO)?.value);
}

export const opcoesCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: DURACAO_DIAS * 24 * 60 * 60,
};
