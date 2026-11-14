"use client";

import { useState, type CSSProperties } from "react";
import { Foto, cx, proporcoes, type ItemGaleria } from "./comum";
import { Lightbox } from "./Lightbox";

export type PropsAlbum = {
  fotos: ItemGaleria[];
  layout: "grade" | "mosaico";
  colunas: number;
  colunasCelular: number;
  espaco: number;
  proporcao: string;
  ampliar: boolean;
};

export function Album({
  fotos,
  layout,
  colunas,
  colunasCelular,
  espaco,
  proporcao,
  ampliar,
  editando,
}: PropsAlbum & { editando?: boolean }) {
  const [aberta, setAberta] = useState<number | null>(null);
  const lista: ItemGaleria[] = fotos?.length ? fotos : Array.from({ length: 6 }, () => ({ src: "" }));
  const clicavel = ampliar && !editando && Boolean(fotos?.length);
  const ratio = layout === "grade" ? proporcoes[proporcao] || "1 / 1" : undefined;

  const estilo = {
    "--colunas": colunas || 3,
    "--colunas-celular": colunasCelular || 2,
    "--espaco": `${espaco ?? 6}px`,
  } as CSSProperties;

  return (
    <>
      <div className={cx("pb-album", layout === "mosaico" && "pb-album--mosaico", clicavel && "pb-album--clicavel")} style={estilo}>
        {lista.map((f, i) => (
          <figure className="pb-album__item" key={i} style={{ aspectRatio: ratio }}>
            {clicavel ? (
              <button className="pb-album__botao" onClick={() => setAberta(i)} aria-label={`Ampliar foto ${i + 1}${f.legenda ? `: ${f.legenda}` : ""}`}>
                <Foto imagem={f} sizes={`(max-width: 720px) ${Math.round(100 / (colunasCelular || 2))}vw, ${Math.round(100 / (colunas || 3))}vw`} />
              </button>
            ) : (
              <Foto imagem={f} mensagemVazio={i === 0 ? "Adicione fotos ao álbum" : ""} />
            )}
          </figure>
        ))}
      </div>
      {aberta !== null && fotos?.length > 0 && (
        <Lightbox itens={fotos} indice={aberta} aoMudar={setAberta} aoFechar={() => setAberta(null)} />
      )}
    </>
  );
}
