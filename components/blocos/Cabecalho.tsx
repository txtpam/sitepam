"use client";

import { useState } from "react";
import { cx, linkExterno } from "./comum";

export type PropsCabecalho = {
  estilo: "claro" | "branco" | "preto" | "petroleo" | "transparente";
  fixo: boolean;
  links: { rotulo: string; link: string }[];
};

const logoPorEstilo: Record<PropsCabecalho["estilo"], string> = {
  claro: "/marca/pb_logo_horizontal_cor.svg",
  branco: "/marca/pb_logo_horizontal_cor.svg",
  preto: "/marca/pb_logo_horizontal_negativo-cor.svg",
  petroleo: "/marca/pb_logo_horizontal_branco.svg",
  transparente: "/marca/pb_logo_horizontal_branco.svg",
};

export function Cabecalho({ estilo, fixo, links, editando }: PropsCabecalho & { editando?: boolean }) {
  const [aberto, setAberto] = useState(false);
  return (
    <header
      className={cx(
        "pb-cabecalho",
        estilo === "transparente" ? "pb-cabecalho--transparente" : `pb-fundo-${estilo}`,
        fixo && estilo !== "transparente" && !editando && "pb-cabecalho--fixo",
      )}
    >
      <div className="pb-container pb-cabecalho__barra">
        <a href="/" className="pb-cabecalho__logo" aria-label="Pamela Burigo Fotografia — início">
          <img src={logoPorEstilo[estilo] || logoPorEstilo.claro} alt="pamela burigo • fotografia" width={195} height={50} />
        </a>
        <nav aria-label="Menu principal">
          <button
            className="pb-cabecalho__abrir"
            aria-expanded={aberto}
            aria-controls="pb-menu"
            onClick={() => setAberto((a) => !a)}
          >
            <span />
            <span />
            <span className="pb-sr">Abrir menu</span>
          </button>
          <ul id="pb-menu" className={cx("pb-cabecalho__menu", aberto && "pb-cabecalho__menu--aberto")}>
            {(links || []).map((l, i) => (
              <li key={i}>
                <a href={l.link || "#"} onClick={() => setAberto(false)} {...linkExterno(l.link)}>
                  {l.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
