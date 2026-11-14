"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Foto, cx, type ItemGaleria } from "./comum";

export type PropsGaleriaMovimento = {
  fotos: ItemGaleria[];
  alturaFotos: number; // % da altura da tela
  espaco: number; // px entre fotos
  velocidade: "rapida" | "normal" | "lenta";
  direcao: "esquerda" | "direita";
  parallax: boolean;
  mostrarLegendas: boolean;
};

const FATOR_VELOCIDADE = { rapida: 0.7, normal: 1, lenta: 1.5 };
const INTENSIDADE_PARALLAX = 0.12; // deslocamento da foto dentro da moldura

/**
 * Seção "presa" na tela enquanto a página rola; a rolagem vertical
 * move o trilho de fotos na horizontal.
 */
export function GaleriaMovimento({
  fotos,
  alturaFotos,
  espaco,
  velocidade,
  direcao,
  parallax,
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
    const molduras = () => Array.from(tr.querySelectorAll<HTMLElement>(".pb-movimento__quadro"));

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
      const vw = win.innerWidth;
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - vh;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      const x = direcao === "esquerda" ? -p * distancia : -(1 - p) * distancia;
      tr.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;

      if (parallax) {
        for (const m of molduras()) {
          const mr = m.getBoundingClientRect();
          if (mr.right < -200 || mr.left > vw + 200) continue;
          const centro = (mr.left + mr.width / 2 - vw / 2) / vw; // -1 … 1
          const img = m.firstElementChild as HTMLElement | null;
          if (img) img.style.transform = `translate3d(${(-centro * INTENSIDADE_PARALLAX * mr.width).toFixed(1)}px, 0, 0) scale(1.18)`;
        }
      }
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
  }, [editando, velocidade, direcao, parallax, lista.length]);

  const estilo = {
    "--altura-fotos": `${alturaFotos || 70}vh`,
    "--espaco": `${espaco ?? 24}px`,
    height: alturaSecao ? `${alturaSecao}px` : undefined,
  } as CSSProperties;

  return (
    <section ref={secao} className={cx("pb-movimento", estatico && "pb-movimento--estatico")} style={estilo}>
      <div className="pb-movimento__palco">
        <div ref={trilho} className="pb-movimento__trilho">
          {intro && <div className="pb-movimento__intro">{intro}</div>}
          {lista.map((f, i) => {
            const ratio = f.largura && f.altura ? f.largura / f.altura : 1.5;
            return (
              <figure key={i} className="pb-movimento__item">
                <div className="pb-movimento__quadro" style={{ aspectRatio: String(ratio), ["--ratio" as string]: ratio }}>
                  <Foto imagem={f} mensagemVazio={i === 0 ? "Adicione fotos" : ""} sizes="(max-width: 720px) 90vw, 60vw" />
                </div>
                {mostrarLegendas && f.legenda && <figcaption className="pb-legenda">{f.legenda}</figcaption>}
              </figure>
            );
          })}
        </div>
        {editando && (
          <p className="pb-movimento__aviso">Prévia — no site publicado, as fotos deslizam conforme a pessoa rola a página.</p>
        )}
      </div>
    </section>
  );
}
