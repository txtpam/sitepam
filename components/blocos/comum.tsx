"use client";

import type { CSSProperties, ReactNode } from "react";

export type Imagem = {
  src: string;
  alt?: string;
  largura?: number;
  altura?: number;
};

export type ItemGaleria = Imagem & { legenda?: string };

export type Fundo =
  | "claro"
  | "branco"
  | "petroleo-claro"
  | "terracota-claro"
  | "petroleo"
  | "preto";

export type Espacamento = "normal" | "compacta" | "sem-espaco";
export type Largura = "estreito" | "normal" | "largo" | "cheio";

export type Botao = {
  texto: string;
  link: string;
  estilo: "destaque" | "escuro" | "contorno";
};

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/** Seção com fundo + espaçamento + container. */
export function Secao({
  fundo = "claro",
  espacamento = "normal",
  largura = "normal",
  className,
  style,
  children,
  id,
}: {
  fundo?: Fundo;
  espacamento?: Espacamento;
  largura?: Largura;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id || undefined}
      className={cx(`pb-fundo-${fundo}`, `pb-secao`, espacamento !== "normal" && `pb-secao--${espacamento}`, className)}
      style={style}
    >
      <div className={cx("pb-container", largura !== "normal" && `pb-container--${largura}`)}>{children}</div>
    </section>
  );
}

export function Foto({
  imagem,
  className,
  sizes,
  prioridade,
  mensagemVazio = "Adicione uma foto",
}: {
  imagem?: Imagem | null;
  className?: string;
  sizes?: string;
  prioridade?: boolean;
  mensagemVazio?: string;
}) {
  if (!imagem?.src) {
    return (
      <div className={cx("pb-vazio", className)}>
        <img className="pb-vazio__icone" src="/marca/pb_simbolo-simplificado_preto.svg" alt="" />
        {mensagemVazio && <span>{mensagemVazio}</span>}
      </div>
    );
  }
  return (
    <img
      src={imagem.src}
      alt={imagem.alt || ""}
      width={imagem.largura}
      height={imagem.altura}
      sizes={sizes}
      className={className}
      loading={prioridade ? "eager" : "lazy"}
      fetchPriority={prioridade ? "high" : undefined}
      decoding="async"
    />
  );
}

export function Botoes({ botoes, editando }: { botoes?: Botao[]; editando?: boolean }) {
  const validos = (botoes || []).filter((b) => b.texto);
  if (!validos.length) return null;
  return (
    <div className="pb-botoes">
      {validos.map((b, i) => (
        <a
          key={i}
          href={b.link || "#"}
          className={`pb-botao pb-botao--${b.estilo || "destaque"}`}
          tabIndex={editando ? -1 : undefined}
          {...linkExterno(b.link)}
        >
          {b.texto}
        </a>
      ))}
    </div>
  );
}

export function linkExterno(link?: string) {
  return link && /^https?:\/\//.test(link) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

/** Converte texto com quebras de linha em parágrafos. */
export function Paragrafos({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <>
      {texto
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>
            {p.split("\n").map((linha, j, arr) => (
              <span key={j}>
                {linha}
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </p>
        ))}
    </>
  );
}

export const proporcoes: Record<string, string | undefined> = {
  original: undefined,
  "3:2": "3 / 2",
  "2:3": "2 / 3",
  "4:5": "4 / 5",
  "1:1": "1 / 1",
  "16:9": "16 / 9",
  "21:9": "21 / 9",
};

export function IconeSeta({ direcao }: { direcao: "esq" | "dir" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      {direcao === "esq" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  );
}
