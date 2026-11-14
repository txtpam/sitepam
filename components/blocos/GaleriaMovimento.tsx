"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Foto, cx, type ItemGaleria } from "./comum";

export type PropsGaleriaMovimento = {
  fotos: ItemGaleria[];
  alturaFotos: number; // % da altura da tela
  espaco?: number; // não usado: as fotos ficam sempre coladas
  velocidade: "rapida" | "normal" | "lenta";
  direcao: "esquerda" | "direita";
  parallax?: boolean; // não usado: o efeito recortava as fotos
  mostrarLegendas: boolean;
};

const FATOR_VELOCIDADE = { rapida: 0.7, normal: 1, lenta: 1.5 };

/**
 * Seção "presa" na tela enquanto a página rola; a rolagem vertical
 * move o trilho de fotos na horizontal.
 */
export function GaleriaMovimento({
  fotos,
  alturaFotos,
  velocidade,
  direcao,
  mostrarLegendas,
  intro,
  editando,
}: PropsGaleriaMovimento & { intro?: ReactNode; editando?: boolean }) {
  const secao = useRef<HTMLElement>(null);
  const trilho = useRef<HTMLDivElement>(null);
  const [alturaSecao, setAlturaSecao] = useState<number | null>(null);
  const [estatico, setEstatico] = useState(true);

  const lista: ItemGaleria[] = fotos?.length ? fotos : Array.from({ length: 5 }, () => ({ src: "" }));

  useEffect(() => {
    const el = secao.current;
    const tr = trilho.current;
    if (!el || !tr) return;
    const win = el.ownerDocument.defaultView || window;
    const reduzir = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // No editor (ou com "reduzir movimento" ativado) mostramos uma faixa simples.
    if (editando || reduzir) {
      setEstatico(true);
      setAlturaSecao(null);
      return;
    }
    setEstatico(false);

    let distancia = 0;
    let quadro = 0;

    const medir = () => {
      const vw = win.innerWidth;
      const vh = win.innerHeight;
      distancia = Math.max(0, tr.scrollWidth - vw);
      setAlturaSecao(Math.round(vh + distancia * FATOR_VELOCIDADE[velocidade]));
      atualizar();
    };

    const atualizar = () => {
      quadro = 0;
      const vh = win.innerHeight;
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - vh;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      const x = direcao === "esquerda" ? -p * distancia : -(1 - p) * distancia;
      tr.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;

    };

    const agendar = () => {
      if (!quadro) quadro = win.requestAnimationFrame(atualizar);
    };

    const obs = new ResizeObserver(medir);
    obs.observe(tr);
    win.addEventListener("scroll", agendar, { passive: true });
    win.addEventListener("resize", medir);
    medir();

    return () => {
      obs.disconnect();
      win.removeEventListener("scroll", agendar);
      win.removeEventListener("resize", medir);
      if (quadro) win.cancelAnimationFrame(quadro);
    };
  }, [editando, velocidade, direcao, lista.length]);

  const estilo = {
    "--altura-fotos": `${alturaFotos || 70}vh`,
    height: alturaSecao ? `${alturaSecao}px` : undefined,
  } as CSSProperties;

  return (
    <section ref={secao} className={cx("pb-movimento", estatico && "pb-movimento--estatico")} style={estilo}>
      <div className="pb-movimento__palco">
        <div ref={trilho} className="pb-movimento__trilho">
          {intro && <div className="pb-movimento__intro">{intro}</div>}
          {lista.map((f, i) => (
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
          ))}
        </div>
        {editando && (
          <p className="pb-movimento__aviso">Prévia — no site publicado, as fotos deslizam conforme a pessoa rola a página.</p>
        )}
      </div>
    </section>
  );
}
