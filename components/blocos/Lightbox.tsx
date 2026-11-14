"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IconeSeta, type ItemGaleria } from "./comum";

export function Lightbox({
  itens,
  indice,
  aoMudar,
  aoFechar,
}: {
  itens: ItemGaleria[];
  indice: number;
  aoMudar: (i: number) => void;
  aoFechar: () => void;
}) {
  const total = itens.length;
  const item = itens[indice];
  const toqueX = useRef<number | null>(null);
  const fechar = useRef<HTMLButtonElement>(null);

  const anterior = useCallback(() => aoMudar((indice - 1 + total) % total), [indice, total, aoMudar]);
  const proxima = useCallback(() => aoMudar((indice + 1) % total), [indice, total, aoMudar]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") proxima();
    };
    window.addEventListener("keydown", tecla);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fechar.current?.focus();
    return () => {
      window.removeEventListener("keydown", tecla);
      document.body.style.overflow = overflow;
    };
  }, [anterior, proxima, aoFechar]);

  // pré-carrega a próxima
  useEffect(() => {
    const prox = itens[(indice + 1) % total];
    if (prox?.src) new window.Image().src = prox.src;
  }, [indice, itens, total]);

  if (!item) return null;

  return createPortal(
    <div
      className="pb-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Visualização de foto"
      onTouchStart={(e) => (toqueX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (toqueX.current === null) return;
        const dx = e.changedTouches[0].clientX - toqueX.current;
        if (Math.abs(dx) > 50) (dx > 0 ? anterior : proxima)();
        toqueX.current = null;
      }}
    >
      <div className="pb-lightbox__topo">
        <span>
          {indice + 1} / {total}
        </span>
        <button ref={fechar} className="pb-lightbox__botao" onClick={aoFechar} aria-label="Fechar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
      </div>
      <div className="pb-lightbox__palco" onClick={(e) => e.target === e.currentTarget && aoFechar()}>
        <img src={item.src} alt={item.alt || item.legenda || ""} />
        {total > 1 && (
          <>
            <button className="pb-lightbox__botao pb-lightbox__nav pb-lightbox__nav--ant" onClick={anterior} aria-label="Foto anterior">
              <IconeSeta direcao="esq" />
            </button>
            <button className="pb-lightbox__botao pb-lightbox__nav pb-lightbox__nav--prox" onClick={proxima} aria-label="Próxima foto">
              <IconeSeta direcao="dir" />
            </button>
          </>
        )}
      </div>
      <div className="pb-lightbox__legenda">{item.legenda}</div>
    </div>,
    document.body,
  );
}
