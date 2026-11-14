"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Foto, IconeSeta, cx, proporcoes, type ItemGaleria } from "./comum";

export type PropsCarrossel = {
  fotos: ItemGaleria[];
  proporcao: string;
  modo: "uma" | "varias";
  automatico: boolean;
  intervalo: number;
  mostrarSetas: boolean;
  mostrarPontos: boolean;
  mostrarLegendas: boolean;
};

export function Carrossel({
  fotos,
  proporcao,
  modo,
  automatico,
  intervalo,
  mostrarSetas,
  mostrarPontos,
  mostrarLegendas,
  editando,
}: PropsCarrossel & { editando?: boolean }) {
  const lista = fotos?.length ? fotos : [{ src: "" }, { src: "" }, { src: "" }];
  const plugins = automatico && !editando ? [Autoplay({ delay: Math.max(2, intervalo || 5) * 1000, stopOnInteraction: false, stopOnMouseEnter: true })] : [];
  const [ref, api] = useEmblaCarousel({ loop: lista.length > 1, align: "start" }, plugins);
  const [ativo, setAtivo] = useState(0);
  const [qtd, setQtd] = useState(0);

  const atualizar = useCallback(() => {
    if (!api) return;
    setAtivo(api.selectedScrollSnap());
    setQtd(api.scrollSnapList().length);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    atualizar();
    api.on("select", atualizar).on("reInit", atualizar);
    return () => {
      api.off("select", atualizar).off("reInit", atualizar);
    };
  }, [api, atualizar]);

  const ratio = proporcoes[proporcao] || "3 / 2";

  return (
    <div className={cx("pb-carrossel", modo === "varias" && "pb-carrossel--varias")} aria-roledescription="carrossel">
      <div className="pb-carrossel__janela" ref={ref}>
        <div className="pb-carrossel__trilho">
          {lista.map((f, i) => (
            <div
              className="pb-carrossel__slide"
              key={i}
              style={{ aspectRatio: ratio }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${lista.length}`}
            >
              <Foto imagem={f} prioridade={i === 0} mensagemVazio="Adicione fotos ao carrossel" />
              {mostrarLegendas && f.legenda && <div className="pb-carrossel__legenda">{f.legenda}</div>}
            </div>
          ))}
        </div>
      </div>
      {mostrarSetas && lista.length > 1 && (
        <>
          <button className="pb-carrossel__seta pb-carrossel__seta--ant" onClick={() => api?.scrollPrev()} aria-label="Foto anterior">
            <IconeSeta direcao="esq" />
          </button>
          <button className="pb-carrossel__seta pb-carrossel__seta--prox" onClick={() => api?.scrollNext()} aria-label="Próxima foto">
            <IconeSeta direcao="dir" />
          </button>
        </>
      )}
      {mostrarPontos && qtd > 1 && (
        <div className="pb-carrossel__pontos">
          {Array.from({ length: qtd }).map((_, i) => (
            <button
              key={i}
              className={cx("pb-carrossel__ponto", i === ativo && "pb-carrossel__ponto--ativo")}
              onClick={() => api?.scrollTo(i)}
              aria-label={`Ir para a foto ${i + 1}`}
              aria-current={i === ativo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
