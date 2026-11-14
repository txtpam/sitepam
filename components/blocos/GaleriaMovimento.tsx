"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Foto, cx, type ItemGaleria } from "./comum";

export type PropsGaleriaMovimento = {
  fotos: ItemGaleria[];
  alturaFotos: number; // % da altura da tela
  velocidade: "rapida" | "normal" | "lenta";
  direcao: "esquerda" | "direita";
  mostrarLegendas: boolean;
  espaco?: number; // não usado: as fotos ficam sempre coladas
  parallax?: boolean; // não usado
};

// pixels por segundo
const VELOCIDADE = { lenta: 30, normal: 60, rapida: 110 };

/**
 * Faixa de fotos que desliza sozinha, em loop contínuo.
 * Não prende a página nem depende da rolagem: o visitante navega normalmente.
 * Para o loop não ter emenda, o conjunto de fotos é repetido o suficiente para
 * cobrir a tela, e a faixa anda exatamente a largura de um conjunto.
 */
export function GaleriaMovimento({ fotos, alturaFotos, velocidade, direcao, mostrarLegendas }: PropsGaleriaMovimento) {
  const conjunto = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(0);
  const [copias, setCopias] = useState(2);

  const lista: ItemGaleria[] = fotos?.length ? fotos : Array.from({ length: 5 }, () => ({ src: "" }));

  useEffect(() => {
    const el = conjunto.current;
    if (!el) return;
    const win = el.ownerDocument.defaultView || window;
    const medir = () => {
      const w = el.getBoundingClientRect().width;
      if (!w) return;
      setLargura(w);
      setCopias(Math.max(2, Math.ceil(win.innerWidth / w) + 1));
    };
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    win.addEventListener("resize", medir);
    medir();
    return () => {
      obs.disconnect();
      win.removeEventListener("resize", medir);
    };
  }, [lista.length]);

  const estilo = {
    "--altura-fotos": `${alturaFotos || 60}vh`,
    "--desloc": `${largura}px`,
    "--duracao": `${largura ? largura / (VELOCIDADE[velocidade] || VELOCIDADE.normal) : 0}s`,
  } as CSSProperties;

  const itens = lista.map((f, i) => (
    // o quadro assume o tamanho da própria foto: nada é recortado
    <figure key={i} className="pb-movimento__item">
      <div
        className={cx("pb-movimento__quadro", Boolean(f.largura && f.altura) && "pb-movimento__quadro--medido")}
        style={f.largura && f.altura ? ({ ["--ratio" as string]: f.largura / f.altura } as CSSProperties) : undefined}
      >
        <Foto imagem={f} mensagemVazio={i === 0 ? "Adicione fotos" : ""} sizes="(max-width: 720px) 90vw, 60vw" />
      </div>
      {mostrarLegendas && f.legenda && <figcaption className="pb-legenda">{f.legenda}</figcaption>}
    </figure>
  ));

  return (
    <div className="pb-movimento" style={estilo} aria-roledescription="galeria em movimento">
      <div
        className={cx(
          "pb-movimento__trilho",
          largura > 0 && "pb-movimento__trilho--ativo",
          direcao === "direita" && "pb-movimento__trilho--direita",
        )}
      >
        {Array.from({ length: copias }).map((_, c) => (
          <div key={c} ref={c === 0 ? conjunto : undefined} className="pb-movimento__conjunto" aria-hidden={c > 0 || undefined}>
            {itens}
          </div>
        ))}
      </div>
    </div>
  );
}
